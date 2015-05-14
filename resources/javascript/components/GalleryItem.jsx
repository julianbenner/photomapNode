"use strict";
var React = require('react/addons');
var Dispatcher = require('./Dispatcher.js');
var OverlayStore = require('./OverlayStore.js');
var config = require('../config_client');

var GalleryItem = React.createClass({
  getInitialState: function () {
    return {};
  },

  componentDidMount: function () {
  },

  componentWillUnmount: function () {
  },

  selectImage: function () {
    Dispatcher.dispatch({
      eventName: 'select-image',
      id: this.props.id
    });
  },

  render: function () {
    if (typeof OverlayStore.getImage(this.props.id) !== 'undefined') {
      const imagePath = '/' + config.imagePath + '/' + OverlayStore.getImage(this.props.id).id + '/thumb';
      return (
        <div className="thumbnail" onClick={this.selectImage}>
          <img src={imagePath}/>
        </div>
      );
    } else {
      return (<div></div>);
    }
  }
});

module.exports = GalleryItem;