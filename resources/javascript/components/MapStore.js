'use strict';
var Dispatcher = require('./Dispatcher.js');
var assign = require('object-assign');
var EventEmitter = require('events').EventEmitter;
var $ = require('jquery');

var zoom = 12;
var rasterSize = function () {
  return 360 / Math.pow(2, zoom);
};

var markers = [];

var latMin = 0.0;
var latMax = 0.0;
var lonMin = 0.0;
var lonMax = 0.0;

var _lat;
var _lon;

var dateMin = null;
var dateMax = null;

var folderFilter = {};
var folderFilteringEnabled = false;

function geosearch(query, token) {
  $.getJSON('https://api.tiles.mapbox.com/v4/geocode/mapbox.places/' + query + '.json?access_token=' + token).done(function (data) {
    if (data.features.length > 0) {
      var result = data.features[0];
      _lat = result.center[1];
      _lon = result.center[0];
      console.log('result ' + _lat + ' ' + _lon);
      MapStore.emit('viewport-change');
    }
  });
}

function loadMarker(lat, lon) {
  "use strict";
  var latMin = (lat * rasterSize())-90;
  var latMax = (((lat + 1) * rasterSize()))-90;
  var lonMin = (lon * rasterSize())-180;
  var lonMax = (((lon + 1) * rasterSize()))-180;

  $.getJSON("get_image_count", {
    latMin: latMin,
    latMax: latMax,
    lonMin: lonMin,
    lonMax: lonMax,
    dateMin: dateMin,
    dateMax: dateMax,
    folderFilter: JSON.stringify(folderFilter),
    folderFilteringEnabled: folderFilteringEnabled
  }).done(function (data) {
    if (typeof markers[lat] !== 'undefined') { // make sure Marker row is initialized
      if (data.SUCCESS === true) { // JSON should carry SUCCESS parameter
        markers[lat][lon] = data; // puts the avg lat/lon and images count in the array
        MapStore.emit('refresh-markers'); // refresh-markers assumes the connection is working and will remove warning symbols
      } else {
        //MapStore.emit('connection-trouble'); // connection-trouble will trigger showing a warning symbol
      }
    }
  });
}

function loadMarkers() {
  var rasterBounds = function (deg) {
    return Math.floor(deg / rasterSize());
  };
  var latRasterStart = rasterBounds(latMin+90);
  var latRasterEnd = rasterBounds(latMax+90);
  var lonRasterStart = rasterBounds(lonMin+180);
  var lonRasterEnd = rasterBounds(lonMax+180);

  for (var i = latRasterStart; i <= latRasterEnd; i = i + 1) {
    if (typeof markers[i] === 'undefined') {
      markers[i] = [];
    }

    for (var j = lonRasterStart; j <= lonRasterEnd; j = j + 1) {
      if (typeof markers[i][j] === 'undefined') { // if it is not undefined, assume it is already set
        loadMarker(i, j);
      }
    }
  }
}

function clearMarkers() {
  markers = [];
}

var MapStore = assign({}, EventEmitter.prototype, {
  getRasterSize: function () {
    return rasterSize()
  },

  getSingleImage: function (lat, lon, callback) {
    loadGallery(lat, lon, function (data) {
      callback(data);
    });
  },

  getDateMin: function () {
    return dateMin;
  },

  getDateMax: function () {
    return dateMax;
  },

  getFolderFilter: function () {
    return folderFilter;
  },

  getFolderFilteringEnabled: function () {
    return folderFilteringEnabled;
  },

  getMarkers: function () {
    return markers;
  },

  getLatLon: function () {
    return L.latLng(_lat, _lon);
  }
});

Dispatcher.register(function (payload) {
  switch (payload.eventName) {
    case 'drag-map':
      latMin = payload.bounds.lat_min;
      latMax = payload.bounds.lat_max;
      lonMin = payload.bounds.lon_min;
      lonMax = payload.bounds.lon_max;
      loadMarkers();
      break;
    case 'zoom-map':
      zoom = payload.zoom;
      clearMarkers();
      latMin = payload.bounds.lat_min;
      latMax = payload.bounds.lat_max;
      lonMin = payload.bounds.lon_min;
      lonMax = payload.bounds.lon_max;
      loadMarkers();
      break;
    case 'filter-by-folder':
      clearMarkers();
      folderFilter = payload.folders;
      folderFilteringEnabled = true;
      loadMarkers();
      break;
    case 'change-date':
      clearMarkers();
      // date should be string 'YYYY-MM-DD'
      dateMin = payload.startDate === null ? null : payload.startDate;
      dateMax = payload.endDate === null ? null : payload.endDate;
      loadMarkers();
      break;
    case 'click-map':
      MapStore.emit('click-map');
      break;
    case 'geosearch':
      geosearch(payload.query, ((typeof payload.token !== 'undefined')?payload.token:null));
      break;
    case 'folder-structure-changed':
      MapStore.emit('update-folder-list');
      break;
  }

  return true;
});

module.exports = MapStore;