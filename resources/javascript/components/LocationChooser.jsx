"use strict";
var React = require('react/addons');
require('mapbox.js');
var Dispatcher = require('./Dispatcher.js');
var FileStore = require('./FileStore.js');
var LocationChooserSearch = require('./LocationChooserSearch.jsx');
var LocationChooserMarker = require('./LocationChooserMarker.jsx');
var config = require('../config_client');

function getFileStoreState() {
  const location = FileStore.getLocation();
  return {
    lat: location.lat,
    lon: location.lon
  }
}

var LocationChooser = React.createClass({
  getInitialState: function () {
    return {
      initialized: false, // determines whether the map has been slid out yet
      lat: this.props.lat,
      lon: this.props.lon
    };
  },

  componentDidMount: function () {
    L.mapbox.accessToken = this.props.token;

    FileStore.on('toggle-location-chooser', this.toggle);
    FileStore.on('change', this.update);
  },

  componentWillUnmount: function () {
    FileStore.removeListener('toggle-location-chooser', this.toggle);
    FileStore.removeListener('change', this.update);
  },

  updateMap: function () {
    this.map.setView(L.latLng(this.state.lat, this.state.lon));
  },

  update: function () {
    this.setState(getFileStoreState(), () => {
      this.updateMap();
    })
  },

  setLocation: function (lat, lon) {
    Dispatcher.dispatch({
      eventName: 'change-location',
      lat: lat,
      lon: lon
    });
  },

  toggle: function () {
    $(React.findDOMNode(this)).slideToggle("fast", () => {
      if (!this.state.initialized) {
        const initialLat = this.props.lat || config.initial.lat;
        const initialLon = this.props.lon || config.initial.lon;
        var map = this.map = L.mapbox.map(React.findDOMNode(this), 'examples.map-i86nkdio')
          .setView([initialLat, initialLon], config.initial.zoom);

        // lol
        map.on('click', (e) => {
          var x = e.clientX; var y = e.clientY;
          var element = document.elementFromPoint(x, y);
          if ($(element).is("a") || $(element).is("input")){} else
            this.setLocation(e.latlng.lat, e.latlng.lng);
        });

        this.setState({
          initialized: true
        });
      }
    });
  },

  render: function () {
    const marker = typeof this.map === 'undefined' ? '' : <LocationChooserMarker key={this.state.lat+'.'+this.state.lon} lat={this.state.lat} lon={this.state.lon} map={this.map} />;
    return (
      <div id='locationChooser'><LocationChooserSearch token={this.props.token} />{marker}</div>
    );
  }
});

module.exports = LocationChooser;