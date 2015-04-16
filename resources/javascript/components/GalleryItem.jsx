"use strict";
var React = require('react/addons');
var Dispatcher = require('./Dispatcher.js');
var MapStore = require('./MapStore.js');

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
    const imagePath = "/image/" + MapStore.getImage(this.props.id).id + "/thumb";
    return (
      <div className="thumbnail" onClick={this.selectImage}>
        <img src={imagePath}/>
      </div>
    );
  }
});

module.exports = GalleryItem;