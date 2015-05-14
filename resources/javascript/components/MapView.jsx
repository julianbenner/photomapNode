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

    const map = this.map = L.mapbox.map(React.findDOMNode(this), 'examples.map-i86nkdio')
      .setView([config.initial.lat, config.initial.lon], config.initial.zoom);

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
    this.map.setView(MapStore.getLatLon());
  },

  addMarker: function (lat, lon, size, text) {
    this.setState({
      markers: this.state.markers.concat([{lat: lat, lon: lon, size: size, text: text, map: this.map}])
    });
  },

  render: function () {
    const map = this.map;
    const markers = this.state.markers;

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
    });

    return (
      <div id='map'>
        {marker}
      </div>
    );
  }
});

module.exports = MapView;