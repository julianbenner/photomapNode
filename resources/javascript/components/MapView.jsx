"use strict";
var React = require('react/addons');
require('mapbox.js');
var Marker = require('./Marker.jsx');
var Dispatcher = require('./Dispatcher.js');
var MapStore = require('./MapStore.js');
var config = require('../config_client');

var MapView = React.createClass({
  getInitialState: function () {
    return {
      markers: []
    };
  },

  componentDidMount: function () {
    L.mapbox.accessToken = this.props.token;

    const southWest = L.latLng(-90, -180);
    const northEast = L.latLng(90, 180);
    const maxBounds = L.latLngBounds(southWest, northEast);

    const map = this.map = L.mapbox.map(React.findDOMNode(this), config.mapboxStyle)
      .setView([config.initial.lat, config.initial.lon], config.initial.zoom)
      .setMaxBounds(maxBounds);

    map.on('moveend', () => {
      Dispatcher.dispatch({
        eventName: 'drag-map',
        bounds: this.getBounds()
      });
    });
    map.on('zoomend', () => {
      Dispatcher.dispatch({
        eventName: 'zoom-map',
        bounds: this.getBounds(),
        zoom: map.getZoom()
      });
    });
    map.on('click', () => {
      Dispatcher.dispatch({
        eventName: 'click-map'
      });
    });

    MapStore.on('refresh-markers', this.refreshMarkers);
    MapStore.on('viewport-change', this.viewportChange);

    Dispatcher.dispatch({
      eventName: 'zoom-map',
      bounds: this.getBounds(),
      zoom: map.getZoom()
    });
  },

  componentWillUnmount: function () {
    MapStore.removeListener('refresh-markers', this.refreshMarkers);
    MapStore.removeListener('viewport-change', this.viewportChange);
  },

  getBounds: function () {
    var bounds = this.map.getBounds();
    return {
      lat_min: bounds._southWest.lat,
      lat_max: bounds._northEast.lat,
      lon_min: bounds._southWest.lng,
      lon_max: bounds._northEast.lng
    };
  },

  refreshMarkers: function () {
    this.setState({
      markers: MapStore.getMarkers()
    });
  },

  viewportChange: function () {
    this.map.setView(MapStore.getLatLon(), Math.ceil(MapStore.getZoom()));
  },

  addMarker: function (lat, lon, size, text) {
    this.setState({
      markers: this.state.markers.concat([{lat: lat, lon: lon, size: size, text: text, map: this.map}])
    });
  },

  render: function () {
    const map = this.map;
    const markers = this.state.markers;

    const marker = [];
    const bounds = MapStore.getBounds();
    const rasterSize = config.rasterSize(MapStore.getZoom());
    const iMin = Math.floor((bounds.latMin + 90) / rasterSize);
    const iMax = Math.ceil((bounds.latMax + 90) / rasterSize);
    const jMin = Math.floor((bounds.lonMin + 180) / rasterSize);
    const jMax = Math.ceil((bounds.lonMax + 180) / rasterSize);

    for (let i = iMin; i <= iMax; i++) {
      if (typeof markers[i] !== 'undefined') {
        for (let j = jMin; j <= jMax; j++) {
          if (typeof markers[i][j] !== 'undefined') {
            const item = markers[i][j];
            if (item.image_count > 0)
              marker.push(<Marker lat={i} lon={j} key={i+'.'+j}
                                  avg_lat={item.avg_lat} avg_lon={item.avg_lon}
                                  size={config.circleSize(item.image_count)}
                                  text={item.image_count} map={map}/>);
          }
        }
      }
    }
/*
    const marker = markers.map(i => {
      return i.map(j => {
        if (j.image_count > 0) {
          const lat = markers.indexOf(i);
          const lon = i.indexOf(j);
          return (
            <Marker lat={lat} lon={lon}
                    avg_lat={j.avg_lat} avg_lon={j.avg_lon}
                    size={config.circleSize(j.image_count)}
                    text={j.image_count} map={map}/>);
        }
        return false;
      });
    });*/

    // circle marker needed for Firefox compatibility
    return (
      <div id='map'>
        <svg width="0" height="0"><clipPath id="circleMarker"><circle cy="16.5" cx="16.5" r="16"></circle></clipPath></svg>
        {marker}
      </div>
    );
  }
});

module.exports = MapView;
