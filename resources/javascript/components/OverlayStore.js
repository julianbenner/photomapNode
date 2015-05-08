'use strict';
var Dispatcher = require('./Dispatcher.js');
var assign = require('object-assign');
var EventEmitter = require('events').EventEmitter;
var $ = require('jquery');

var CHANGE_EVENT = 'change';
var overlayMode = '';
var overlayVisible = false;

var OverlayStore = assign({}, EventEmitter.prototype, {
  isVisible: function () {
    return overlayVisible;
  },

  getOverlayMode: function () {
    return overlayMode;
  }
});

Dispatcher.register(function (payload) {
  switch (payload.eventName) {
    case 'open-login-dialog':
      overlayMode = 'login';
      overlayVisible = true;
      OverlayStore.emit(CHANGE_EVENT);
      break;

    case 'hide-overlay':
      overlayVisible = false;
      OverlayStore.emit(CHANGE_EVENT);
      break;
  }

  return true;
});

module.exports = OverlayStore;