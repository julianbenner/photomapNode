"use strict";
var React = require('react/addons');
var Dispatcher = require('./Dispatcher.js');
var MapStore = require('./MapStore.js');
var Folder = require('./Folder');
var classNames = require('classnames');

function getState() {
  return {
    folderStructure: MapStore.getFolderStructure(),
    folderFilteringEnabled: MapStore.getFolderFilteringEnabled()
  };
}

var FolderWidget = React.createClass({
  getInitialState: function () {
    return getState();
  },

  componentDidMount: function () {
    MapStore.on('change', this._onChange);
  },

  componentWillUnmount: function () {
    MapStore.on('change', this._onChange);
  },
  
  toggleList: function (event) {
    $("#folderDropdown").slideToggle();
  },

  _onChange: function () {
    this.setState(getState());
  },

  deselectEverything: function () {
    this.state.folderStructure.deselectEverything();
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

  resetFolderFilter: function () {
    Dispatcher.dispatch({
      eventName: 'reset-folder-filter'
    });
    this.deselectEverything();
    this.toggleList();
  },

  render: function () {
    const content = this.state.folderStructure.toJSX();
    const style = classNames({
      'glyphicon': true,
      'glyphicon-folder-open': true,
      'filterIsActive': this.state.folderFilteringEnabled
    });
    return (
      <li ref="button" title="Filter by folder"><a className="dropdown-toggle" onClick={this.toggleList}><span className={style} aria-hidden="true"></span><span className="navbar-button-text">Folders</span></a>
        <ul id="folderDropdown" className="dropdown-menu folder">
          {content}
          <div className="dropdown-buttons">
            <input type="button" value="Apply" onClick={this.applyFolderFilter} className="btn btn-primary" />
            <input type="button" value="Reset" onClick={this.resetFolderFilter} className="btn btn-danger" />
          </div>
        </ul>
      </li>
    );
  }
});

module.exports = FolderWidget;
