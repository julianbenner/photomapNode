"use strict";
var React = require('react/addons');
var Dispatcher = require('./Dispatcher.js');
var MapStore = require('./MapStore.js');
var FolderWidgetFolder = require('./FolderWidgetFolder.jsx');

var FolderWidget = React.createClass({
  getInitialState: function () {
    return {};
  },

  componentDidMount: function () {
  },

  componentWillUnmount: function () {
  },

  toggleList: function (event) {
    $("#folderDropdown").slideToggle();
  },

  render: function () {
    return (
      <li><a className="dropdown-toggle" onClick={this.toggleList}>Folders</a>
        <ul id="folderDropdown" className="dropdown-menu">
          <FolderWidgetFolder root="images" indent="0"/>
        </ul>
      </li>
    );
  }
});

module.exports = FolderWidget;