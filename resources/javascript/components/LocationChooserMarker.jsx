"use strict";
var React = require('react/addons');
require('mapbox.js');

var LocationChooserMarker = React.createClass({
  componentDidMount: function () {
    "use strict";
    const lat = this.props.lat;
    const lon = this.props.lon;

    this.setState({
      marker: L.marker([lat, lon])
    }, () => {
      this.state.marker.addTo(this.props.map);
    });
  },

  componentWillUnmount: function () {
    this.props.map.removeLayer(this.state.marker);
  },

  render: function () {
    return false;
  }
});

module.exports = LocationChooserMarker;