var React = require('react');
var Dispatcher = require('./Dispatcher.js');
var classNames = require('classnames');
var config = require('../config_client');

var FileListItem = React.createClass({
  propTypes: {
    index: React.PropTypes.number.isRequired,
    lat: React.PropTypes.number,
    lon: React.PropTypes.number,
    name: React.PropTypes.string
  },

  getInitialState: function () {
    return {};
  },

  toggleEdit: function () {
    Dispatcher.dispatch({
      eventName: 'select-file',
      fileIndex: this.props.index
    });
  },

  render: function () {
    const classes = classNames({
      'list-group-item': true,
      'active': this.props.selected
    });
    const aStyle = {
      backgroundColor: this.props.lon == '' || this.props.lon == null || this.props.lat == '' || this.props.lat == null ? '#b32' : ''
    };
    const path = config.imagePath + '/' + this.props.index + '/tinySquare';

    return (
      <a href="#" className={classes} style={aStyle} onClick={this.toggleEdit}>
        <img src={path} className="editThumbnail" />
        {this.props.name}
      </a>
    );
  }
});

module.exports = FileListItem;