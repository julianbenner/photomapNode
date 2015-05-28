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
      if (typeof this.props.map !== 'undefined')
        this.state.marker.addTo(this.props.map);
    });
  },

  componentWillUnmount: function () {
    if (typeof this.props.map !== 'undefined')
      this.props.map.removeLayer(this.state.marker);
  },

  render: function () {
    return false;
  }
});

module.exports = LocationChooserMarker;