const { remote } = require('electron');
const path = require('path');
const Config = require('electron-config');

const DEFAULT_BASE_DESTINATION = path.join(remote.app.getPath('videos'), 'YouTube');

const KEYS = {
  BASE_DESTINATION: 'base_destination',
  DOWNLOADS: 'downloads',
};

let config;
export var init = function () {
  config = new Config();

  if (! config.has(KEYS.BASE_DESTINATION)) {
    config.set(KEYS.BASE_DESTINATION, DEFAULT_BASE_DESTINATION);
  }

  if (! config.has(KEYS.DOWNLOADS)) {
    config.set(KEYS.DOWNLOADS, {});
  }
};

export var clear = function () {
  config.clear();
}

export var save = function (key, value) {
  config.set(key, value);
};

export var get = function (key) {
  config.get(key);
};

export var getBaseDestination = function () {
  return config.get(KEYS.BASE_DESTINATION);
}

export var setBaseDestination = function (baseDestination) {
  config.set(KEYS.BASE_DESTINATION, baseDestination);
}

// Downloads
export var getDownloads = function () {
  return config.get(KEYS.DOWNLOADS);
}

export var hasVideoInDownloads = function (id) {
  return Object.keys(getDownloads()).indexOf(id) > -1;
}

export var addVideoInDownloads = function (id, info) {
  const downloads = config.get(KEYS.DOWNLOADS);
  if (hasVideoInDownloads(id)) {
    throw new Error('Already in list');
  }

  downloads[id] = info;

  config.set(KEYS.DOWNLOADS, downloads);
}

export var removeVideoFromDownloads = function (id) {
  config.delete(KEYS.DOWNLOADS + '.' + id);
}
