'use strict';
var React = require('react/addons');
var Dispatcher = require('./Dispatcher.js');
var MapStore = require('./MapStore.js');

var DateRangePicker = React.createClass({
  toggleOpen: function() {
    $("#dateDropdown").slideToggle();
  },

  handleFromChange: function(e) {
    this.setState({
      from: e.target.value
    });
  },

  handleToChange: function(e) {
    this.setState({
      to: e.target.value
    });
  },

  applyDateFilter: function() {
    Dispatcher.dispatch({
      eventName: 'change-date',
      startDate: this.state.from,
      endDate: this.state.to
    });
  },

  resetDateFilter: function() {
    Dispatcher.dispatch({
      eventName: 'change-date',
      startDate: null,
      endDate: null
    });
  },

  render: function() {
    return (
      <li><a className="dropdown-toggle" onClick={this.toggleOpen}><span className="glyphicon glyphicon-calendar" aria-hidden="true"></span><span className="navItemTitle">Date</span></a>
        <ul id="dateDropdown" className="dropdown-menu">
          From <input type="date" id="dateFrom" name="dateFrom" className="dateInput" onChange={this.handleFromChange} /><br />
          to <input type="date" id="dateTo" name="dateFrom" className="dateInput" onChange={this.handleToChange} /><br />
          <div className="dropdown-buttons">
            <input type="button" value="Apply" onClick={this.applyDateFilter} className="btn btn-primary" />
            <input type="button" value="Reset" onClick={this.resetDateFilter} className="btn" />
          </div>
        </ul>
      </li>
    );
  }
});
module.exports = DateRangePicker;