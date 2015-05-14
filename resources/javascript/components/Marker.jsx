"use strict";
var React = require('react/addons');
require('mapbox.js');
var Dispatcher = require('./Dispatcher.js');
var MapStore = require('./MapStore');
//var Promise = require('promise');

var Marker = React.createClass({
  getInitialState: function () {
    return {
      marker: {}
    };
  },

  componentDidMount: function () {
    "use strict";
    const lat = this.props.lat;
    const lon = this.props.lon;
    // if text is 1, there is only a single picture and we add a custom style
    const stylePromise = new Promise((resolve, reject) => {
      if (this.props.text == '1') {
        MapStore.getSingleImage(lat, lon, function (data) {
          if (typeof data[0] !== 'undefined')
            resolve(data[0].id);
          else
            resolve('');
        })
      } else {
        resolve('')
      }
    });
    stylePromise.then(val => {
      let content, style;
      if (val === '') {
        style = '';
        content = this.props.text;
      } else {
        style = 'style="background-image:url(image/' + val + '/tiny);top:0;transform:none;height:100%;-webkit-clip-path:circle(16px)"';
        content = '';
      }
      const html = '<div class="image_count_child" ' + style + ' data-toggle="modal" data-target="#myModal">' + content + '</div>';
      this.setState({
        marker: L.marker([this.props.avg_lat, this.props.avg_lon], {
          icon: L.divIcon({
            html: html,
            iconSize: [this.props.size, this.props.size],
            className: 'image_count'
          })
        }).on('click', () => {
          Dispatcher.dispatch({
            eventName: 'show-gallery'
          });
          Dispatcher.dispatch({
            eventName: 'load-gallery',
            lat: lat,
            lon: lon
          });
        })
      }, () => {
        this.state.marker.addTo(this.props.map);
      });
    });
  },

  componentWillUnmount: function () {
    this.props.map.removeLayer(this.state.marker);
  },

  render: function () {
    return false;
  }
});

module.exports = Marker;