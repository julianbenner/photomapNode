'use strict';
var Dispatcher = require('./Dispatcher.js');
var assign = require('object-assign');
var MapStore = require('./MapStore');
var EventEmitter = require('events').EventEmitter;
var $ = require('jquery');

var CHANGE_EVENT = 'change';
var overlayMode = '';
var overlayVisible = false;
var gallery = [];
var selectedImage = 0;

function prevImage() {
  if (selectedImage === 0) {
    selectedImage = gallery.length - 1;
  } else {
    selectedImage = selectedImage - 1;
  }
}

function nextImage() {
  if (selectedImage === gallery.length - 1) {
    selectedImage = 0;
  } else {
    selectedImage = selectedImage + 1;
  }
}

var OverlayStore = assign({}, EventEmitter.prototype, {
  isVisible: function () {
    return overlayVisible;
  },

  getOverlayMode: function () {
    return overlayMode;
  },


  getGallery: function () {
    return gallery;
  },

  getSelectedImageId: function () {
    if (typeof gallery[selectedImage] !== 'undefined') {
      return gallery[selectedImage].id; }
    else {
      return 0;
    }
  },

  getSelectedImage: function () {
    return gallery[selectedImage];
  },

  getImage: function (i) {
    return gallery[i];
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

    case 'load-gallery':
      MapStore.loadGallery(payload.lat, payload.lon, function (data) {
        gallery = data;
        OverlayStore.emit(CHANGE_EVENT);
      });
      break;

    case 'show-gallery':
      overlayMode = 'gallery';
      overlayVisible = true;
      OverlayStore.emit(CHANGE_EVENT);
      break;

    case 'edit-image':
      overlayMode = 'edit';
      OverlayStore.emit(CHANGE_EVENT);
      break;

    case 'select-image':
      selectedImage = payload.id;
      overlayMode = 'image';
      OverlayStore.emit(CHANGE_EVENT);
      break;

    case 'prev-image':
      prevImage();
      OverlayStore.emit(CHANGE_EVENT);
      break;

    case 'next-image':
      nextImage();
      OverlayStore.emit(CHANGE_EVENT);
      break;
  }

  return true;
});

module.exports = OverlayStore;