import { getBaseDestination, getProxy, addVideoInDownloads, filterVideoInfoToStore } from '../storage/storage';

const youtubedl = require('youtube-dl');
const path = require('path');
const fs = require('fs');
const { remote } = require('electron');

export var init = function () { };

export var downloadVideo = function (link, onInfo, onProgress, onError, onEnd, filePath = '') {
  const resuming = filePath !== '';

  let downloaded = 0;
  let total = 0;
  if (resuming && fs.existsSync(filePath)) {
    downloaded = fs.statSync(filePath).size;
  }

  const baseDestination = getBaseDestination();
  if (! fs.existsSync(baseDestination)) {
    fs.mkdirSync(baseDestination);
  }

  const video = youtubedl(
    link,
    getOptions(),
    { start: downloaded, cwd: baseDestination }
  );

  let size = 0;
  video.on('info', function (info) {
    size = info.size;
    total = size;
    if (resuming) {
      console.log('Resuming download');
      total += downloaded;
    } else {
      console.log('Beginning download');

      const destination = getDestination(baseDestination, info);
      if (! fs.existsSync(destination)) {
        fs.mkdirSync(destination);
      }

      filePath = getFilePath(destination, info);
    }

    onInfo(info, filePath);
    video.pipe(fs.createWriteStream(filePath, { flags: 'a' }));

    if (! resuming) {
      addVideoInDownloads(info.id, filterVideoInfoToStore(info, filePath));
    }
  });

  video.on('data', function (chunk) {
    downloaded += chunk.length;

    if (size > 0) {
      onProgress((downloaded / total) * 100);
    }
  });

  video.on('error', onError);
  video.on('end', () => {
    console.log('finished downloading!');
    onEnd(filePath);
  });
};

function getOptions() {
  const options = ['--format=18'];

  const proxy = getProxy();
  if(typeof proxy !== 'undefined') {
    options.push('--proxy=' + proxy);
  }

  return options;
}

function getDestination(baseDestination, info) {
  if (info.playlist === null || info.playlist === 'NA') {
    return path.join(baseDestination, info.uploader);
  }

  return path.join(baseDestination, info.uploader, info.playlist);
}

function getFilePath(destination, info) {
  if (info.playlist_index === null || info.playlist_index === 'NA') {
    return path.join(destination, info._filename);
  }

  return path.join(destination, info.playlist_index + ' - ' + info._filename);
}
