var ApplicationStore = require('./ApplicationStore');
var Dispatcher = require('./Dispatcher.js');
var assign = require('object-assign');
var EventEmitter = require('events').EventEmitter;

var pageSize = 10;

var _page = 1;
var _files = [];
var _fileIndex = 0;
var _location = {lat: null, lon: null};
var CHANGE_EVENT = 'change';

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
    return -1; // TODO
  },

  getAmountOfPages: function () {
    return Math.ceil(_files.length / pageSize);
  },

  getLocation: function () {
    return _location;
  },

  doFullScan: function () {
    $.getJSON('/admin/fullscan', function () {
    });
  }
});

Dispatcher.register(function (payload) {
  switch (payload.eventName) {
    case 'load-files':
      $.getJSON("/admin/list?page=" + 1 + "&amount=all&token=" + ApplicationStore.getLoginToken(), function (data) {
        _files = data;
        if (typeof payload.fileIndex !== 'undefined') {
          _fileIndex = payload.fileIndex;
          const currentlySelectedId = FileStore.getItemIdByDbId(_fileIndex);
          if (typeof _files[currentlySelectedId] !== 'undefined')
            _files[currentlySelectedId].selected = true;
        }
        FileStore.emit(CHANGE_EVENT);
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
      _files[FileStore.getItemIdByDbId(_fileIndex)].selected = true;
      FileStore.emit(CHANGE_EVENT);
      break;
    case 'toggle-location-chooser':
      FileStore.emit('toggle-location-chooser');
      break;
    case 'change-location':
      _location = {lat: payload.lat, lon: payload.lon};
      FileStore.emit('location-changed');
      break;
    case 'files-full-scan':
      doFullScan();
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
  }

  return true;
});

module.exports = FileStore;