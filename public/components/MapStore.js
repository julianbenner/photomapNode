var Dispatcher = require('./Dispatcher.js');
var assign = require('object-assign');
var EventEmitter = require('events').EventEmitter;
var $ = require('jquery');

var zoom = 12;
var rasterSize = function() { return 480/Math.pow(2,zoom); };

var markers = [];
var gallery = [];
var selectedImage = 0;
var overlayMode = '';

var latMin = 0.0;
var latMax = 0.0;
var lonMin = 0.0;
var lonMax = 0.0;

var _lat;
var _lon;

var dateMin = null;
var dateMax = null;

function geosearch(query) {
    (new google.maps.Geocoder()).geocode({address: query}, function(data) {
        if (data.length > 0) {
            var result = data[0];
            _lat = result.geometry.location.lat();
            _lon = result.geometry.location.lng();
            console.log('result ' + _lat + ' ' + _lon);
            MapStore.emit('viewport-change');
        }
    });
}

function loadMarker(lat, lon) {
    "use strict";
    var latMin = lat*rasterSize();
    var latMax =  ((lat+1) * rasterSize());
    var lonMin = lon*rasterSize();
    var lonMax =  ((lon+1) * rasterSize());

    $.getJSON("get_image_count", {
        latMin: latMin,
        latMax: latMax,
        lonMin: lonMin,
        lonMax: lonMax,
        dateMin: dateMin,
        dateMax: dateMax
    }).done(function(data) {
        if (typeof markers[lat] !== 'undefined') { // make sure Marker row is initialized
            if (data.SUCCESS === true) { // JSON should carry SUCCESS parameter
                markers[lat][lon] = data; // puts the avg lat/lon and images count in the array
                MapStore.emit('refresh-markers'); // refresh-markers assumes the connection is working and will remove warning symbols
            } else {
                MapStore.emit('connection-trouble'); // connection-trouble will trigger showing a warning symbol
            }
        }
    });
}

function loadMarkers() {
    "use strict";
    var latRasterElements = Math.ceil((latMax - latMin) / rasterSize());
    var lonRasterElements = Math.ceil((lonMax - lonMin) / rasterSize());

    var rasterBounds = function(deg) { return Math.floor(deg / rasterSize()); };
    var latRasterStart = rasterBounds(latMin);
    var latRasterEnd = rasterBounds(latMax);
    var lonRasterStart = rasterBounds(lonMin);
    var lonRasterEnd = rasterBounds(lonMax);

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
    $.getJSON("get_image_list/", {
        latMin: lat * rasterSize(),
        latMax: ((lat+1) * rasterSize()),
        lonMin: lon * rasterSize(),
        lonMax: ((lon+1) * rasterSize()),
        dateMin: dateMin,
        dateMax: dateMax
    }).done(function(data) {
        gallery = data;
        MapStore.emit('refresh-gallery');
    });
}

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

function clearMarkers() {
    markers = [];
}

var MapStore = assign({}, EventEmitter.prototype, {
    getMarkers: function () {
        return markers;
    },

    getGallery: function () {
        return gallery;
    },

    getSelectedImageId: function () {
        return gallery[selectedImage].id;
    },

    getSelectedImage: function () {
        return gallery[selectedImage];
    },

    getImage: function (i) {
        return gallery[i];
    },

    getOverlayMode: function () {
        return overlayMode;
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
        case 'change-date':
            clearMarkers();
            dateMin = payload.startDate === null ? null : payload.startDate.format('YYYY-M-D');
            dateMax = payload.endDate === null ? null : payload.endDate.format('YYYY-M-D');
            loadMarkers();
            break;
        case 'show-gallery':
            MapStore.emit('show-overlay');
            overlayMode = 'gallery';
            if (typeof payload.lat !== 'undefined' && typeof payload.lon !== 'undefined')
                loadGallery(payload.lat, payload.lon);
            else
                MapStore.emit('refresh-gallery');
            MapStore.emit('update-overlay');
            break;
        case 'edit-image':
            overlayMode = 'edit';
            MapStore.emit('update-overlay');
            break;
        case 'select-image':
            selectedImage = payload.id;
            overlayMode = 'image';
            MapStore.emit('update-overlay');
            break;
        case 'prev-image':
            prevImage();
            MapStore.emit('update-overlay');
            break;
        case 'next-image':
            nextImage();
            MapStore.emit('update-overlay');
            break;
        case 'click-map':
            MapStore.emit('click-map');
            break;
        case 'geosearch':
            geosearch(payload.query);
            break;
    }

    return true;
});

module.exports = MapStore;