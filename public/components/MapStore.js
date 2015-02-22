var Dispatcher = require('./Dispatcher.js');
var assign = require('object-assign');
var EventEmitter = require('events').EventEmitter;
var $ = require('jquery');

var zoom = 14;
var rasterSize = function() { return 480/Math.pow(2,zoom); };

var markers = [];

function loadMarker(lat, lon) {
    $.getJSON("get_image_count/" + lat*rasterSize() + "," + ((lat+1) * rasterSize()) + "," + lon*rasterSize() + "," + ((lon + 1) * rasterSize()), function(data) {
        markers[lat][lon] = data;
        MapStore.emit('refresh-markers');
    });
}

function loadMarkers(lat_min, lat_max, lon_min, lon_max) {
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

var MapStore = assign({}, EventEmitter.prototype, {
    getMarkers: function () {
        return markers;
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
    }

    return true;
});

module.exports = MapStore;