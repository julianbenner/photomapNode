'use strict';
var Dispatcher = require('./Dispatcher.js');
var assign = require('object-assign');
var EventEmitter = require('events').EventEmitter;
var $ = require('jquery');
var config = require('../config_client');
var Folder = require('./Folder');

var zoom = config.initial.zoom;
var rasterSize = function () { return config.rasterSize(zoom) };

var CHANGE_EVENT = 'change';

var markers = [];

var searchResults = [];

var latMin = 0.0;
var latMax = 0.0;
var lonMin = 0.0;
var lonMax = 0.0;

var _lat;
var _lon;

var dateMin = null;
var dateMax = null;

// for filtering
var folderStructure = new Folder('/', false);
var folderFilter = {};
var folderFilteringEnabled = false;

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
      _lat = result.center[1];
      _lon = result.center[0];
      zoom = searchBoundariesToZoom(result.bbox);
      MapStore.emit('viewport-change');
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
    MapStore.emit(CHANGE_EVENT);
  });
}

function loadMarker(lat, lon) {
  "use strict";
  var latMin = (lat * rasterSize())-90;
  var latMax = (((lat + 1) * rasterSize()))-90;
  var lonMin = (lon * rasterSize())-180;
  var lonMax = (((lon + 1) * rasterSize()))-180;


  $.ajax({
    url: '/get_image_count',
    type: 'POST',
    data: {
      latMin: latMin,
      latMax: latMax,
      lonMin: lonMin,
      lonMax: lonMax,
      dateMin: dateMin,
      dateMax: dateMax,
      folderFilter: folderFilter,
      folderFilteringEnabled: folderFilteringEnabled
    },
    success: function (data) {
      if (typeof markers[lat] !== 'undefined') { // make sure Marker row is initialized
        if (data.SUCCESS === true) { // JSON should carry SUCCESS parameter
          markers[lat][lon] = data; // puts the avg lat/lon and images count in the array
          MapStore.emit('refresh-markers'); // refresh-markers assumes the connection is working and will remove warning symbols
        }
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
  loadGallery: function (lat, lon, callback) {
    $.ajax({
      url: '/get_image_list',
      type: 'POST',
      data: {
        latMin: (lat * MapStore.getRasterSize())-90,
        latMax: (((lat + 1) * MapStore.getRasterSize()))-90,
        lonMin: (lon * MapStore.getRasterSize())-180,
        lonMax: (((lon + 1) * MapStore.getRasterSize()))-180,
        dateMin: MapStore.getDateMin(),
        dateMax: MapStore.getDateMax(),
        folderFilter: MapStore.getFolderFilter(),
        folderFilteringEnabled: MapStore.getFolderFilteringEnabled()
      },
      success: function (data) {
        callback(data);
      }
    });

    /*$.getJSON("get_image_list/", {
      latMin: (lat * MapStore.getRasterSize())-90,
      latMax: (((lat + 1) * MapStore.getRasterSize()))-90,
      lonMin: (lon * MapStore.getRasterSize())-180,
      lonMax: (((lon + 1) * MapStore.getRasterSize()))-180,
      dateMin: MapStore.getDateMin(),
      dateMax: MapStore.getDateMax(),
      folderFilter: JSON.stringify(MapStore.getFolderFilter()),
      folderFilteringEnabled: MapStore.getFolderFilteringEnabled()
    }).done(function (data) {
      callback(data);
    });*/
  },

  getRasterSize: function () {
    return rasterSize()
  },

  getSingleImage: function (lat, lon, callback) {
    this.loadGallery(lat, lon, function (data) {
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

  getDateFilteringEnabled: function () {
    return dateMin != null || dateMax != null;
  },

  getMarkers: function () {
    return markers;
  },

  getLatLon: function () {
    return L.latLng(_lat, _lon);
  },

  getZoom: function () {
    return zoom;
  },

  getBounds: function () {
    return {
      latMin: latMin,
      latMax: latMax,
      lonMin: lonMin,
      lonMax: lonMax
    }
  },

  getSearchResults: function () {
    return searchResults;
  },

  getFolderStructure: function () {
    return folderStructure;
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
      MapStore.emit(CHANGE_EVENT);
      break;
    case 'reset-folder-filter':
      clearMarkers();
      folderFilter = {};
      folderFilteringEnabled = false;
      loadMarkers();
      MapStore.emit(CHANGE_EVENT);
      break;
    case 'change-date':
      clearMarkers();
      // date should be string 'YYYY-MM-DD'
      dateMin = payload.startDate === null ? null : payload.startDate;
      dateMax = payload.endDate === null ? null : payload.endDate;
      loadMarkers();
      MapStore.emit(CHANGE_EVENT);
      break;
    case 'click-map':
      MapStore.emit('click-map');
      break;
    // directly jump
    case 'geosearch':
      geosearch(payload.query);
      break;
    // with results
    case 'geosearch1':
      geosearch1(payload.query);
      break;
    case 'folder-structure-changed':
      MapStore.emit(CHANGE_EVENT);
      break;
    case 'move-map':
      _lat = payload.lat;
      _lon = payload.lon;
      zoom = payload.zoom;
      MapStore.emit('viewport-change');
      break;
  }

  return true;
});

module.exports = MapStore;