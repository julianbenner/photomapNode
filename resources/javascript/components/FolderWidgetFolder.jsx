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

    var indent = Array(parseInt(this.props.indent) + 1).join("-");
    var name = this.props.root.split("/");
    var content = [(<li key="root" onClick={this.toggle}>{indent + name[name.length - 1]}</li>)];
    if (this.state.unfolded)
      content = content.concat(this.state.content.map((item, i) => {
        if (item.type == 'folder') {
          var folderRoot = this.props.root + "/" + item.name;
          return (<FolderWidgetFolder key={i} root={folderRoot} indent={parseInt(this.props.indent) + 1}/>);
        } else {
          return;//(<li key={i}>{item.name}</li>);
        }
      }));

    return (
      <div>{content}</div>
    );
  }
});

module.exports = FolderWidgetFolder;