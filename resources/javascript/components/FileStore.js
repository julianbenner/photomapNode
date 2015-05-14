var ApplicationStore = require('./ApplicationStore');
var Dispatcher = require('./Dispatcher.js');
var assign = require('object-assign');
var EventEmitter = require('events').EventEmitter;

var pageSize = 10;

var _files = [];
var _fileIndex = 0;
var _location = {lat: null, lon: null};

var FileStore = assign({}, EventEmitter.prototype, {
  getSelectedFilePage: function () {
    for (var i = 0; i != _files.length; i++) {
      if (_files[i].id == _fileIndex) {
        return Math.ceil((i+1) / pageSize);
      }
    }
    return 1;
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
        FileStore.emit('files-changed');
      });
      break;
    case 'edit-file':
      _files[FileStore.getItemIdByDbId(_fileIndex)] = payload.file;
      _files[FileStore.getItemIdByDbId(_fileIndex)].selected = true; // above, we override this property
      $.post("/admin/edit", payload.file).done(function (data) {
        console.log(data);
        FileStore.emit('files-changed');
      });
      break;
    case 'delete-file':
      _files.splice(FileStore.getItemIdByDbId(_fileIndex), 1);
      $.ajax({
        url: '/admin/delete',
        type: 'DELETE',
        data: payload.file,
        success: function (data) {
          console.log(data);
          FileStore.emit('files-changed');
        }
      });
      break;
    case 'select-file':
      var currentlySelected = _files[FileStore.getItemIdByDbId(_fileIndex)];
      if (typeof currentlySelected !== 'undefined')
        _files[FileStore.getItemIdByDbId(_fileIndex)].selected = false;
      _fileIndex = payload.fileIndex;
      _files[FileStore.getItemIdByDbId(_fileIndex)].selected = true;
      FileStore.emit('files-changed');
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
  }

  return true;
});

module.exports = FileStore;