"use strict";
var React = require('react/addons');
require('mapbox.js');
var Dispatcher = require('./Dispatcher.js');
var FileStore = require('./FileStore.js');
var LocationChooserSearch = require('./LocationChooserSearch.jsx');
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
      initialized: false // determines whether the map has been slid out yet
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

        map.on('click', (e) => {
          this.setLocation(e.latlng.lat, e.latlng.lng);
        });

        this.setState({
          initialized: true
        });
      }
    });
  },

  render: function () {
    return (
      <div id='locationChooser'><LocationChooserSearch token={this.props.token} /></div>
    );
  }
});

module.exports = LocationChooser;