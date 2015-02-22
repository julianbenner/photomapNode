var Dispatcher = require('./Dispatcher.js');
var assign = require('object-assign');
var EventEmitter = require('events').EventEmitter;
var $ = require('jquery');

var zoom = 12;
var rasterSize = function() { return 480/Math.pow(2,zoom); };

var markers = [];
var gallery = [];
var selectedImage = 0;

function loadMarker(lat, lon) {
    "use strict";
    $.getJSON("get_image_count/" + lat*rasterSize() + "," + ((lat+1) * rasterSize()) + "," + lon*rasterSize() + "," + ((lon + 1) * rasterSize()), function(data) {
        if (typeof markers[lat] !== 'undefined') {
            markers[lat][lon] = data;
            MapStore.emit('refresh-markers');
        }
    });
}

function loadMarkers(lat_min, lat_max, lon_min, lon_max) {
    "use strict";
    var latRasterElements = Math.ceil((lat_max - lat_min) / rasterSize());
    var lonRasterElements = Math.ceil((lon_max - lon_min) / rasterSize());

    var rasterBounds = function(deg) { return Math.floor(deg / rasterSize()); };
    var latRasterStart = rasterBounds(lat_min);
    var latRasterEnd = rasterBounds(lat_max);
    var lonRasterStart = rasterBounds(lon_min);
    var lonRasterEnd = rasterBounds(lon_max);

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

function loadGallery(lat, lon) {
    "use strict";
    $.getJSON("get_image_list/" + lat*rasterSize() + "," + ((lat+1) * rasterSize()) + "," + lon*rasterSize() + "," + ((lon + 1) * rasterSize()), {}).
    success(function (data) {
        gallery = data;
        MapStore.emit('refresh-gallery');
    });
}

var MapStore = assign({}, EventEmitter.prototype, {
    getMarkers: function () {
        return markers;
    },

    getGallery: function () {
        return gallery;
    },

    getSelectedImage: function () {
        return selectedImage;
    }
});

Dispatcher.register(function (payload) {
    switch (payload.eventName) {
        case 'drag-map':
            loadMarkers(payload.bounds.lat_min, payload.bounds.lat_max, payload.bounds.lon_min, payload.bounds.lon_max);
            break;
        case 'zoom-map':
            zoom = payload.zoom;
            markers = [];
            loadMarkers(payload.bounds.lat_min, payload.bounds.lat_max, payload.bounds.lon_min, payload.bounds.lon_max);
            break;
        case 'show-gallery':
            MapStore.emit('show-gallery');
            loadGallery(payload.lat, payload.lon);
            break;
        case 'select-image':
            selectedImage = payload.id;
            MapStore.emit('select-image');
            break;
    }

    return true;
});

module.exports = MapStore;