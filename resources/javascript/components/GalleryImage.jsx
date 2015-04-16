"use strict";
var React = require('react/addons');
var Dispatcher = require('./Dispatcher.js');
var MapStore = require('./MapStore.js');

var GalleryImage = React.createClass({
  getInitialState: function () {
    return {};
  },

  componentDidMount: function () {
    document.onkeydown = this.onKeyDown;
  },

  componentWillUnmount: function () {
    document.onkeydown = null;
  },

  onKeyDown: function (e) {
    switch (e.keyCode) {
      case 37: // left arrow
        Dispatcher.dispatch({
          eventName: 'prev-image'
        });
        break;

      case 39: // right arrow
        Dispatcher.dispatch({
          eventName: 'next-image'
        });
        break;
    }
  },

  render: function () {
    const path = "/image/" + MapStore.getSelectedImage().id;
    return (
      <div id="galleryImageContainer">
        <img src={path} id="galleryImage"/>
      </div>
    );
  }
});

module.exports = GalleryImage;