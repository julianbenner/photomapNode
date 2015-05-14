"use strict";
var React = require('react/addons');
var Dispatcher = require('./Dispatcher.js');
var MapStore = require('./MapStore.js');
var $ = require('jquery');

var FolderWidgetFolder = React.createClass({
  getInitialState: function () {
    return {
      content: [],
      unfolded: false
    };
  },

  componentDidMount: function () {
    $.getJSON("get_folder_content", {
      root: this.props.root
    }).done((data) => {
      this.setState({
        content: data
      });
    });

    if (this.props.indent === 0) {
      this.setState({
        unfolded: true
      });
    }
  },

  componentWillUnmount: function () {
  },

  toggle: function (event) {
    this.setState({
      unfolded: !this.state.unfolded
    });
  },

  render: function () {
    "use strict";

    var name = this.props.root.split("/");
    if (name[0] === '') name[0] = '/';
    var header = [(<input type="checkbox" name={this.props.root} />),(<label htmlFor={this.props.root} onClick={this.toggle}>{name[name.length - 1]}</label>)];
    var content = [];
    if (this.state.unfolded)
      content = content.concat(this.state.content.map((item, i) => {
        if (item.type == 'folder') {
          var folderRoot = this.props.root + "/" + item.name;
          return (<FolderWidgetFolder key={i} root={folderRoot} />);
        } else {
          return <div></div>;
        }
      }));

    return (
      <li><span className="folderItem">{header}</span><ul className="folder">{content}</ul></li>
    );
  }
});

module.exports = FolderWidgetFolder;