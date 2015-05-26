"use strict";
var React = require('react/addons');
var Dispatcher = require('./Dispatcher.js');

var SearchWidget = React.createClass({
  propTypes: {
    token: React.PropTypes.string.isRequired
  },

  getInitialState: function () {
    return {value: ""};
  },

  componentDidMount: function () {
  },

  componentWillUnmount: function () {
  },

  search: function () {
    Dispatcher.dispatch({
      eventName: 'geosearch',
      token: this.props.token,
      query: this.state.value
    });
  },

  handleChange: function (event) {
    this.setState({value: event.target.value});
  },

  keypress: function (event) {
    if (event.key === 'Enter') { // as of React 0.13, keyCode is always 0 (?)
      this.search();
    }
  },

  render: function () {
    return (
      <div className="searchWidget" role="search" key="searchWidget">
        <span className="input-group add-on">
          <input onKeyPress={this.keypress} type="text" className="form-control" placeholder="Search"
                 id="locationQuery" value={this.state.value} onChange={this.handleChange}></input>
          <div className="input-group-btn">
            <button className="btn btn-default" onClick={this.search}><span className="glyphicon glyphicon-search"></span>
            </button>
          </div>
        </span>
      </div>
    );
  }
});

module.exports = SearchWidget;