"use strict";
var React = require('react/addons');
require('mapbox.js');
var Dispatcher = require('./Dispatcher.js');
var FileStore = require('./FileStore.js');
var config = require('../config_client');


var LocationChooser = React.createClass({
  getInitialState: function () {
    return {
      initialized: false // determines whether the map has been slid out yet
    };
  },

  componentDidMount: function () {
    L.mapbox.accessToken = this.props.token;

    FileStore.on('toggle-location-chooser', this.toggle);
  },

  componentWillUnmount: function () {
    FileStore.removeListener('toggle-location-chooser', this.toggle);
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
      <div id='locationChooser'></div>
    );
  }
});

module.exports = LocationChooser;