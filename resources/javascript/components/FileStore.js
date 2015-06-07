var ApplicationStore = require('./ApplicationStore');
var Dispatcher = require('./Dispatcher.js');
var assign = require('object-assign');
var EventEmitter = require('events').EventEmitter;
var Folder = require('./Folder');
var config = require('../config_client');

var pageSize = 10;

var _page = 1;
var _files = [];
var _fileIndex = 0;
var _location = {lat: null, lon: null};
var _searchResultViewport = {lat: null, lon: null};
var CHANGE_EVENT = 'change';

// for uploading
var folderStructure = new Folder('/', true);

var searchResults = [];

function getGeosearchUrl(query) {
  return 'https://api.tiles.mapbox.com/v4/geocode/mapbox.places/' + query + '.json?access_token=' + config.token;
}

function searchBoundariesToZoom(bbox) {
  const latSize = bbox[3] - bbox[1];
  const lonSize = bbox[2] - bbox[0];
  const widestExtent = Math.max(latSize, lonSize);
  return 10 - Math.log2(widestExtent);
}

function geosearch(query) {
  $.getJSON(getGeosearchUrl(query)).done(function (data) {
    if (data.features.length > 0) {
      var result = data.features[0];
      _searchResultViewport.lat = result.center[1];
      _searchResultViewport.lon = result.center[0];
      zoom = searchBoundariesToZoom(result.bbox);
      FileStore.emit('search');
    }
  });
}

function geosearch1(query) {
  $.getJSON(getGeosearchUrl(query)).done(function (data) {
    searchResults = data.features.map(function(result) {
      return {
        name: result["place_name"],
        lat: result["center"][1],
        lon: result["center"][0],
        zoom: searchBoundariesToZoom(result.bbox)
      };
    });
    FileStore.emit(CHANGE_EVENT);
  });
}

var sortNoLocation = function(a, b) {
  if (a.lat == null && b.lat != null) {
    return 1;
  } else if (a.lat != null && b.lat == null) {
    return -1;
  } else {
    return 0;
  }
};

var sortNoLocationDesc = function(a, b) {
  return sortNoLocation(a, b) * -1;
};

var FileStore = assign({}, EventEmitter.prototype, {
  getSelectedFilePage: function () {
    for (var i = 0; i != _files.length; i++) {
      if (_files[i].id == _fileIndex) {
        return Math.ceil((i+1) / pageSize);
      }
    }
    return 1;
  },

  getPage: function () {
    return _page;
  },

  getCurrentPageContent: function () {
    return _files.slice((_page - 1) * pageSize, _page * pageSize);
  },

  getPageContent: function (page) {
    return _files.slice((page - 1) * pageSize, page * pageSize);
  },

  getSelectedFile: function () {
    return _files[FileStore.getItemIdByDbId(_fileIndex)];
  },

  getItemIdByDbId: function (id) {
    for (var i = 0; i != _files.length; i++) {
      if (_files[i].id == id) return i;
    }
    return -1;
  },

  getAmountOfPages: function () {
    return Math.ceil(_files.length / pageSize);
  },

  getSearchResults: function () {
    return searchResults;
  },

  getLocation: function () {
    return _location;
  },

  getSearchResultViewport: function () {
    return _searchResultViewport;
  },

  doFullScan: function () {
    $.ajax({
      url: '/admin/fullscan',
      type: 'GET',
      headers: {
        token: ApplicationStore.getLoginToken()
      },
      success: function (data) {
      }
    });
  },

  getFolderStructure: function () {
    return folderStructure;
  },

  getSelectedFolder: function () {
    const folderContent = folderStructure.toJSON();

    const getFoldedSelectedFolder = function (folder, rec) {
      if (folder.selected) {
        return folder;
      } else {
        let selectedFolder = null;
        folder.content.forEach(item => {
          if (typeof item !== 'undefined') {
            const recFolder = rec(item, rec);
            if (typeof recFolder !== 'undefined') {
              selectedFolder = recFolder;
            }
          }
        });
        if (selectedFolder !== null) {
          return selectedFolder;
        }
      }
    };

    return getFoldedSelectedFolder(folderContent, getFoldedSelectedFolder);
  }
});

Dispatcher.register(function (payload) {
  switch (payload.eventName) {
    case 'load-files':
      $.ajax({
        url: '/admin/list?page=1&amount=all',
        type: 'GET',
        headers: {
          token: ApplicationStore.getLoginToken()
        },
        success: function (data) {
          _files = data;
          if (typeof payload.fileIndex !== 'undefined') {
            _fileIndex = payload.fileIndex;
            const currentlySelectedId = FileStore.getItemIdByDbId(_fileIndex);
            if (typeof _files[currentlySelectedId] !== 'undefined')
              _files[currentlySelectedId].selected = true;
          }
          FileStore.emit(CHANGE_EVENT);
        }
      });
      break;
    case 'edit-file':
      _files[FileStore.getItemIdByDbId(_fileIndex)] = payload.file;
      _files[FileStore.getItemIdByDbId(_fileIndex)].selected = true; // above, we override this property
      $.ajax({
        url: '/admin/edit',
        type: 'POST',
        headers: {
          token: ApplicationStore.getLoginToken()
        },
        data: payload.file,
        success: function (data) {
          FileStore.emit(CHANGE_EVENT);
        }
      });
      break;
    case 'delete-file':
      _files.splice(FileStore.getItemIdByDbId(_fileIndex), 1);
      $.ajax({
        url: '/admin/delete',
        type: 'DELETE',
        headers: {
          token: ApplicationStore.getLoginToken()
        },
        data: payload.file,
        success: function (data) {
          FileStore.emit(CHANGE_EVENT);
        }
      });
      break;
    case 'select-file':
      var currentlySelected = _files[FileStore.getItemIdByDbId(_fileIndex)];
      if (typeof currentlySelected !== 'undefined')
        _files[FileStore.getItemIdByDbId(_fileIndex)].selected = false;
      _fileIndex = payload.fileIndex;
      _location = {lat: _files[FileStore.getItemIdByDbId(_fileIndex)].lat, lon: _files[FileStore.getItemIdByDbId(_fileIndex)].lon};
      _files[FileStore.getItemIdByDbId(_fileIndex)].selected = true;
      FileStore.emit(CHANGE_EVENT);
      break;
    case 'toggle-location-chooser':
      FileStore.emit('toggle-location-chooser');
      break;
    case 'change-location':
      _location = {lat: payload.lat, lon: payload.lon};
      FileStore.emit(CHANGE_EVENT);
      break;
    case 'files-full-scan':
      FileStore.doFullScan();
      break;
    case 'files-page':
      _page = payload.page;
      FileStore.emit(CHANGE_EVENT);
      break;
    case 'files-prev-page':
      if (_page > 1) {
        _page--;
        FileStore.emit(CHANGE_EVENT);
      }
      break;
    case 'files-next-page':
      if (_page < FileStore.getAmountOfPages()) {
        _page++;
        FileStore.emit(CHANGE_EVENT);
      }
      break;
    case 'files-sort':
      switch (payload.sort) {
        case 'no-loc-asc':
          _files.sort(sortNoLocation);
          break;
        case 'no-loc-desc':
          _files.sort(sortNoLocationDesc);
          break;
        case 'id-asc':
          _files.sort(function(a,b) { return a.id - b.id; });
          break;
        case 'id-desc':
          _files.sort(function(a,b) { return b.id - a.id; });
          break;
      }
      FileStore.emit(CHANGE_EVENT);
      break;
    case 'geosearch_lc':
      geosearch(payload.query);
      break;
    case 'geosearch1_lc':
      geosearch1(payload.query);
      break;
    case 'move-map_lc':
      _searchResultViewport = {
        lat: payload.lat,
        lon: payload.lon
      };
      FileStore.emit('search');
      break;
    case 'folder-structure-changed':
      FileStore.emit(CHANGE_EVENT);
      break;
  }

  return true;
});

module.exports = FileStore;
