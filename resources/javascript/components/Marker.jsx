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

    stylePromise.then(imageId => {
      let content, style;
      if (imageId === '') {
        style = '';
        content = this.props.text;
      } else {
        style = 'style="background-image:url(image/' + imageId + '/tinySquare);top:0.5px;left:0.5px;transform:none;height:100%;-webkit-clip-path:circle(16px);clip-path:url(\'#circleMarker\')"';
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
          this.loadGallery();
          if (this.props.text != '1')
            this.showGallery();
        })
      }, () => {
        this.state.marker.addTo(this.props.map);
      });
    });
  },

  componentWillUnmount: function () {
    this.props.map.removeLayer(this.state.marker);
  },

  showGallery: function () {
    Dispatcher.dispatch({
      eventName: 'show-gallery'
    });
  },

  loadGallery: function () {
    Dispatcher.dispatch({
      eventName: 'load-gallery',
      lat: this.props.lat,
      lon: this.props.lon
    });
  },

  render: function () {
    return false;
  }
});

module.exports = Marker;