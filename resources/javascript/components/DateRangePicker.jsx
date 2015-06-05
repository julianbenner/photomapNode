'use strict';
var React = require('react/addons');
var Dispatcher = require('./Dispatcher.js');
var MapStore = require('./MapStore.js');

var DateRangePicker = React.createClass({
  toggleOpen: function() {
    $("#dateDropdown").slideToggle();
  },

  componentDidMount: function() {
    // compatibiliy with legacy browsers such as Firefox
    if ( $(React.findDOMNode(this.refs.dateInput)).prop('type') != 'date' ) {
      jQuery.getScript("./javascripts/jquery-ui.min.js", function() {
        $('[type="date"]').datepicker();
        $('<link/>', {
          rel: 'stylesheet',
          type: 'text/css',
          href: '/css/legacy/jquery-ui.min.css'
        }).appendTo('head');
        $('<link/>', {
          rel: 'stylesheet',
          type: 'text/css',
          href: '/css/legacy/jquery-ui.theme.min.css'
        }).appendTo('head');
        $('<link/>', {
          rel: 'stylesheet',
          type: 'text/css',
          href: '/css/legacy/jquery-ui.structure.min.css'
        }).appendTo('head');
      });
    }
  },

  getInitialState: function () {
    return {
      from: new Date(0),
      to: Date.now()
    }
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
    if (this.state.from !== null && this.state.to !== null)
      Dispatcher.dispatch({
        eventName: 'change-date',
        startDate: this.state.from,
        endDate: this.state.to
      });
    this.toggleOpen();
  },

  resetDateFilter: function() {
    Dispatcher.dispatch({
      eventName: 'change-date',
      startDate: null,
      endDate: null
    });
    this.toggleOpen();
  },

  render: function() {
    return (
      <li ref="button" title="Filter by date"><a className="dropdown-toggle" onClick={this.toggleOpen}><span className="glyphicon glyphicon-calendar" aria-hidden="true"></span><span className="navbar-button-text">Date</span></a>
        <ul id="dateDropdown" className="dropdown-menu">
          From <input type="date" id="dateFrom" name="dateFrom" className="dateInput" onChange={this.handleFromChange} ref="dateInput" /><br />
          to <input type="date" id="dateTo" name="dateFrom" className="dateInput" onChange={this.handleToChange} /><br />
          <div className="dropdown-buttons">
            <input type="button" value="Apply" onClick={this.applyDateFilter} className="btn btn-primary" />
            <input type="button" value="Reset" onClick={this.resetDateFilter} className="btn btn-danger" />
          </div>
        </ul>
      </li>
    );
  }
});
module.exports = DateRangePicker;