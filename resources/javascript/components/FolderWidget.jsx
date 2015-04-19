"use strict";
var React = require('react/addons');
var Dispatcher = require('./Dispatcher.js');
var MapStore = require('./MapStore.js');
var FolderWidgetFolder = require('./FolderWidgetFolder.jsx');

class Folder {
  constructor(name) {
    this.name = name;
    this.explored = false;
    this.unfolded = false;
    this.selected = false;
    this.content = [];
    this.toggleFold = this.toggleFold.bind(this);
    this.toggleCheck = this.toggleCheck.bind(this);
  }

  toggleFold() {
    if (!this.explored && !this.unfolded) {
      this.explore(() => {
        this.unfolded = !this.unfolded;
        Dispatcher.dispatch({
          eventName: 'folder-structure-changed'
        });
      });
    } else {
      this.unfolded = !this.unfolded;
      Dispatcher.dispatch({
        eventName: 'folder-structure-changed'
      });
    }
  }

  explore(callback) {
    $.getJSON("get_folder_content", {
      root: this.name
    }).done(data => {
      this.content = data.map(subfolder => {
        if (subfolder !== null)
          return new Folder(((this.name==='/')?'':this.name+'/') + subfolder.name);
      });
      this.explored = true;
      callback();
    });
  }

  toggleCheck() {
    this.selected = !this.selected;
    console.log(this);
  }

  toJSON() {
    const folder = {name: this.name, selected: this.selected, content: []};
    this.content.forEach(subfolder => {
      if (typeof subfolder !== 'undefined') {
        folder.content.push(subfolder.toJSON());
      }
    });
    return folder;
  }

  toJSX() {
    const name = this.name.split("/");
    if (name[1] === '') name[1] = '/';

    let subfolders = [];
    if (this.unfolded) {
      subfolders = this.content.map(folder => {
        if (typeof folder !== 'undefined')
          return folder.toJSX();
      });
    }
    const folderKey = this.name; // TODO

    return <li key={folderKey}><input type="checkbox" onChange={this.toggleCheck} /><label onClick={this.toggleFold}>{name[name.length - 1]}</label><ul>{subfolders}</ul></li>;
  }
}

var FolderWidget = React.createClass({
  getInitialState: function () {
    return {
      folderStructure: new Folder('/')
    };
  },

  componentDidMount: function () {
    MapStore.on('update-folder-list', this.updateFolderList);
  },

  componentWillUnmount: function () {
    MapStore.on('update-folder-list', this.updateFolderList);
  },

  toggleList: function (event) {
    $("#folderDropdown").slideToggle();
  },

  updateFolderList: function () {
    this.forceUpdate();
  },

  debugOutput: function () {
    console.log('fgsfds:');
    var temp = this.state.folderStructure.toJSON();
    console.log(temp);
  },

  applyFolderFilter: function () {
    Dispatcher.dispatch({
      eventName: 'filter-by-folder',
      folders: this.state.folderStructure.toJSON()
    });
  },

  render: function () {
    const content = this.state.folderStructure.toJSX();
    return (
      <li><a className="dropdown-toggle" onClick={this.toggleList}><span className="glyphicon glyphicon-folder-open" aria-hidden="true"></span><span className="navItemTitle">Folders</span></a>
        <ul id="folderDropdown" className="dropdown-menu folder">
          {content}
          <li><button type="button" className="btn btn-default" onClick={this.applyFolderFilter}>Apply</button></li>
        </ul>
      </li>
    );
  }
});

module.exports = FolderWidget;