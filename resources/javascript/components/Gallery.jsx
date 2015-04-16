"use strict";
var React = require('react/addons');
var Dispatcher = require('./Dispatcher.js');
var MapStore = require('./MapStore.js');
var GalleryItem = require('./GalleryItem.jsx');
require('bootstrap');

var Gallery = React.createClass({
  getInitialState: function () {
    return {
      images: []
    };
  },

  componentDidMount: function () {
    MapStore.on('refresh-gallery', this.refreshGallery);
    this.refreshGallery();
  },

  componentWillUnmount: function () {
    MapStore.removeListener('refresh-gallery', this.refreshGallery);
  },

  refreshGallery: function () {
    this.setState({
      images: MapStore.getGallery()
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

// TODO make closable with ESC