"use strict";
var React = require('react/addons');
var Dispatcher = require('./Dispatcher.js');
var MapStore = require('./MapStore.js');
var Overlay = require('./Overlay.jsx');
var MapView = require('./MapView.jsx');

var Application = React.createClass({
  getInitialState: function () {
    return {};
  },

  componentDidMount: function () {
  },

  componentWillUnmount: function () {
  },

  render: function () {
    return (
      <div className="container" id="container-map">
        <MapView token={this.props.token}/>
        <Overlay token={this.props.token}/>
      </div>
    );
  }
});

module.exports = Application;