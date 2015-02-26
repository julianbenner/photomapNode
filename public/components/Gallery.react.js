var React = require('react/addons');
var Dispatcher = require('./Dispatcher.js');
var MapStore = require('./MapStore.js');
var GalleryItem = require('./GalleryItem.react');
var GalleryImage = require('./GalleryImage.react');
require('bootstrap');

"use strict";

var Gallery = React.createClass({
  getInitialState: function () {
    "use strict";
    return {
      displayImage: false,
      images: [],
      image: 0
    };
  },

  componentDidMount: function () {
    "use strict";
    MapStore.on('refresh-gallery', this.refreshGallery);
    this.refreshGallery();
  },

  componentWillUnmount: function () {
    "use strict";
    MapStore.removeListener('refresh-gallery', this.refreshGallery);
  },

  refreshGallery: function () {
    "use strict";
    this.setState({
      images: MapStore.getGallery()
    });
  },

  render: function() {
    "use strict";
    var content = this.state.images.map(function (thumb, i) {
      return (<GalleryItem id={i} key={thumb.id} />);
    });
    return (<div className="galleryContainer">{content}</div>);
  }
});

module.exports = Gallery;