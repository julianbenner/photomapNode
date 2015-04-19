"use strict";
var React = require('react/addons');
var Dispatcher = require('./Dispatcher.js');
var MapStore = require('./MapStore.js');
var Hammer = require('hammerjs');

var GalleryImage = React.createClass({
  getInitialState: function () {
    return {};
  },

  componentDidMount: function () {
    document.addEventListener('keydown', this.onKeyDown);
    var hammertime = new Hammer(React.findDOMNode(this));
    hammertime.on('swipeleft', ev => {
      this.triggerNextImage();
    });
    hammertime.on('swiperight', ev => {
      this.triggerPrevImage();
    });
  },

  componentWillUnmount: function () {
    document.removeEventListener('keydown', this.onKeyDown);
  },

  triggerPrevImage: function () {
    Dispatcher.dispatch({
      eventName: 'prev-image'
    });
  },

  triggerNextImage: function () {
    Dispatcher.dispatch({
      eventName: 'next-image'
    });
  },

  onKeyDown: function (e) {
    switch (e.keyCode) {
      case 37: // left arrow
        this.triggerPrevImage();
        break;

      case 39: // right arrow
        this.triggerNextImage();
        break;
    }
  },

  render: function () {
    const width = window.innerWidth
      || document.documentElement.clientWidth
      || document.body.clientWidth;
    const height = window.innerHeight
      || document.documentElement.clientHeight
      || document.body.clientHeight;

    const size = () => {
      if (width < 600 && height < 600) {
        return 'small';
      } else if (height < 1000) {
        return 'medium';
      } else {
        return 'huge';
      }
    };

    const path = '/image/' + MapStore.getSelectedImage().id + '/' + size();
    return (
      <div id="galleryImageContainer">
        <img src={path} id="galleryImage"/>
      </div>
    );
  }
});

module.exports = GalleryImage;