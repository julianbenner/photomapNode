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
            resolve(data[0]);
          else
            resolve('');
        })
      } else {
        resolve('')
      }
    });

    stylePromise.then(image => {
      let content, style;
      let nose = '';
      if (image === '') {
        style = '';
        content = this.props.text;
      } else {
        style = 'style="background-image:url(image/' + image.id + '/tinySquare);top:0.5px;left:0.5px;transform:none;height:100%;-webkit-clip-path:circle(16px);clip-path:url(\'#circleMarker\')"';
        content = '';
        if (image.direction !== null) {
          nose = '<div style="width:0;height:0;border-style:solid;border-width:0 4.5px 5px 4.5px;border-color:transparent transparent rgba(39,128,227,.9) transparent;margin-top:-38px;margin-left:14px;transform:rotate(' + image.direction + 'deg);transform-origin:4px 21px;"></div>';
        }
      }
      const html = '<div class="image_count_child" ' + style + ' data-toggle="modal" data-target="#myModal">' + content + '</div>' + nose;
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