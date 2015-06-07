var React = require('react/addons');
var Dispatcher = require('./Dispatcher.js');

module.exports = class Folder {
  constructor(name, radio = false, parent = null) {
    this.name = name;
    this.explored = false;
    this.unfolded = false;
    this.selected = false;
    this.content = [];
    this.radio = radio;
    this.parent = parent;
    this.toggleFold = this.toggleFold.bind(this);
    this.toggleCheck = this.toggleCheck.bind(this);
    this.setSelected = this.setSelected.bind(this);
  }

  toggleFold(e) {
    e.stopPropagation(); // when + is clicked, prevent row from being checked
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
        if (subfolder !== null) {
          const subfolderObject = new Folder(((this.name === '/') ? '' : this.name + '/') + subfolder.name, this.radio, this);
          if (this.selected) subfolderObject.selected = true;
          return subfolderObject;
        }
      });
      this.explored = true;
      callback();
    });
  }

  passDeselectMessageToDescendant() {
    if (this.parent === null) {
      // assume we are descendant
      this.deselectEverything();
    } else {
      if (typeof this.parent !== 'undefined') {
        this.parent.passDeselectMessageToDescendant();
      }
    }
  }

  deselectEverything() {
    this.selected = false;
    this.content.forEach(item => {
      if (typeof item !== 'undefined') {
        item.deselectEverything();
      }
    })
  }

  setSelected(selected) {
    // if radio button deselect everything
    if (this.radio === true) {
      this.passDeselectMessageToDescendant();
      this.selected = selected;
    } else {
      this.selected = selected;
      this.content.forEach(child => {
        if (typeof child !== 'undefined')
          if (typeof child.setSelected !== 'undefined')
            child.setSelected(selected);
      });
    }
  }

  toggleCheck() {
    const newStatus = !this.selected;
    this.setSelected(newStatus);
    Dispatcher.dispatch({
      eventName: 'folder-structure-changed'
    });
  }

  toJSON() {
    const folder = {
      name: this.name === '/' ? '' : this.name,
      selected: this.selected,
      allSubfoldersSelected: false,
      content: []
    };
    if (this.explored) {
      this.content.forEach(subfolder => {
        if (typeof subfolder !== 'undefined') {
          folder.content.push(subfolder.toJSON());
        }
      });
    } else {
      if (this.selected) {
        folder.allSubfoldersSelected = true;
      }
    }
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
    const folderKey = this.name;
    const foldElement = this.unfolded ? '-' : '+';
    const type = this.radio ? 'radio' : 'checkbox';
    return (
    <li key={folderKey}>
      <span className="folderName" onClick={this.toggleCheck}>
        <a onClick={this.toggleFold}>{foldElement}</a>
        <input readOnly type={type} checked={this.selected} />
        <label>{name[name.length - 1]}</label>
      </span>
      <ul className="folder">{subfolders}</ul>
    </li>);
  }
};