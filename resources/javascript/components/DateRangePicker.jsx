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
    $(React.findDOMNode(this.refs.button)).tooltip();
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
      <li data-toggle="tooltip" data-placement="bottom" ref="button" title="Filter by date"><a className="dropdown-toggle" onClick={this.toggleOpen}><span className="glyphicon glyphicon-calendar" aria-hidden="true"></span><span className="navItemTitle">Date</span></a>
        <ul id="dateDropdown" className="dropdown-menu">
          From <input type="date" id="dateFrom" name="dateFrom" className="dateInput" onChange={this.handleFromChange} ref="dateInput" /><br />
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