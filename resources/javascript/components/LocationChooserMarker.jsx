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
      if (this.mayRender())
        this.state.marker.addTo(this.props.map);
    });
  },

  mayRender: function () {
    return typeof this.props.map !== 'undefined' && !(this.props.lat === null || typeof this.props.lat === 'undefined');
  },

  componentWillUnmount: function () {
    if (this.mayRender())
      this.props.map.removeLayer(this.state.marker);
  },

  render: function () {
    return false;
  }
});

module.exports = LocationChooserMarker;