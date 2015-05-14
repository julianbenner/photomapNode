var React = require('react');
var Dispatcher = require('./Dispatcher.js');
var classNames = require('classnames');

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
      backgroundColor: this.props.lon == '' || this.props.lon == null || this.props.lat == '' || this.props.lat == null ? '#fee' : ''
    };
    const path = "/image/" + this.props.index + '/tiny';

    return (
      <a href="#" className={classes} style={aStyle} onClick={this.toggleEdit}>
        <img src={path} />
        {this.props.index} - {this.props.name}
        <span className="small">{this.props.lat}, {this.props.lon}</span>
      </a>
    );
  }
});

module.exports = FileListItem;