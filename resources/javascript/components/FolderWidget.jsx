"use strict";
var React = require('react/addons');
var Dispatcher = require('./Dispatcher.js');
var MapStore = require('./MapStore.js');
var Folder = require('./Folder');

function getFolderStructure() {
  return {
    folderStructure: MapStore.getFolderStructure()
  };
}

var FolderWidget = React.createClass({
  getInitialState: function () {
    return getFolderStructure();
  },

  componentDidMount: function () {
    MapStore.on('change', this.updateFolderList);
  },

  componentWillUnmount: function () {
    MapStore.on('change', this.updateFolderList);
  },

  toggleList: function (event) {
    $("#folderDropdown").slideToggle();
  },

  updateFolderList: function () {
    //this.forceUpdate();
    this.setState(getFolderStructure());
  },

  debugOutput: function () {
    var temp = this.state.folderStructure.toJSON();
    console.log(temp);
  },

  applyFolderFilter: function () {
    Dispatcher.dispatch({
      eventName: 'filter-by-folder',
      folders: this.state.folderStructure.toJSON()
    });
    this.toggleList();
  },

  render: function () {
    const content = this.state.folderStructure.toJSX();
    return (
      <li ref="button" title="Filter by folder"><a className="dropdown-toggle" onClick={this.toggleList}><span className="glyphicon glyphicon-folder-open" aria-hidden="true"></span><span className="navbar-button-text">Folders</span></a>
        <ul id="folderDropdown" className="dropdown-menu folder">
          {content}
          <div className="dropdown-buttons">
            <input type="button" value="Apply" onClick={this.applyFolderFilter} className="btn btn-primary" />
            <input type="button" value="Reset" onClick={this.resetFolderFilter} className="btn" />
          </div>
        </ul>
      </li>
    );
  }
});

module.exports = FolderWidget;