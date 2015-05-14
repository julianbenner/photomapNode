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