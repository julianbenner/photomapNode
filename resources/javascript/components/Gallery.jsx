"use strict";
var React = require('react/addons');
var Dispatcher = require('./Dispatcher.js');
var MapStore = require('./MapStore.js');
var OverlayStore = require('./OverlayStore.js');
var GalleryItem = require('./GalleryItem.jsx');
require('bootstrap');

var Gallery = React.createClass({
  getInitialState: function () {
    return {
      images: OverlayStore.getGallery()
    };
  },

  componentDidMount: function () {
    OverlayStore.on('change', this.refreshGallery);
  },

  componentWillUnmount: function () {
    OverlayStore.removeListener('change', this.refreshGallery);
  },

  refreshGallery: function () {
    this.setState({
      images: OverlayStore.getGallery()
    }, function() {
      if (this.state.images.length === 1) {
        const id = this.state.images[0].id;
        Dispatcher.dispatch({
          eventName: 'select-image',
          id: id
        });
      }
    });
  },

  render: function () {
    const content = this.state.images.map((thumb, i) => {
      return (<GalleryItem id={i} key={thumb.id}/>);
    });
    return (<div className="galleryContainer">{content}</div>);
  }
});

module.exports = Gallery;