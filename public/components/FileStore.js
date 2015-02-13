var Dispatcher = require('./Dispatcher.js');
var assign = require('object-assign');
var EventEmitter = require('events').EventEmitter;

var pageSize = 5;

var _files = [];
var _fileIndex = 0;

var FileStore = assign({}, EventEmitter.prototype, {
    getPageContent: function (page) {
        var pageContent = _files.slice((page-1)*pageSize, page*pageSize);
        return pageContent;
    },

    getSeletedFile: function () {
        return _fileIndex;
    },

    getItemIdByDbId: function (id) {
        for(var i = 0; i != _files.length; i++) {
            if (_files[i].id == id) return i;
        }
        return -1; // TODO
    }
});

Dispatcher.register(function (payload) {
    switch (payload.eventName) {
        case 'load-files':
            $.getJSON( "/admin/list?page=" + 1 + "&amount=" + 999, function( data ) {
              _files = data;
              FileStore.emit('files-changed');
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
    }

    return true;
});

module.exports = FileStore;