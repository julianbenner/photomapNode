"use strict";
var React = require('react/addons');
var Dispatcher = require('./Dispatcher.js');
var MapStore = require('./MapStore.js');
var DateRangePicker = require('./DateRangePicker.jsx');
var SearchWidget = require('./SearchWidget.jsx');
var FolderWidget = require('./FolderWidget.jsx');

var TopBar = React.createClass({
  propTypes: {
    token: React.PropTypes.string.isRequired
  },

  getInitialState: function () {
    return {};
  },

  componentDidMount: function () {
  },

  componentWillUnmount: function () {
  },

  changeDate: function (event, picker) {
    Dispatcher.dispatch({
      eventName: 'change-date',
      startDate: picker.startDate,
      endDate: picker.endDate
    });
  },

  cancelDate: function (event, picker) {
    Dispatcher.dispatch({
      eventName: 'change-date',
      startDate: null,
      endDate: null
    });
  },

  showConnectionWarning: function () {
  },

  hideConnectionWarning: function () {
  },

  openAdminInterface: function () {
    Dispatcher.dispatch({
      eventName: 'edit-image'
    });
  },

  render: function () {
    const currentDate = new Date();
    const day = currentDate.getDate();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    const buttons = [];

    buttons.push(<SearchWidget token={this.props.token} key="searchWidget"/>);
    buttons.push(<FolderWidget key="folderWidget"/>);
    buttons.push(<DateRangePicker key="dateRangePicker" onApply={this.changeDate} onCancel={this.cancelDate}
                                                            startDate="01.01.1970"
                                                            endDate={day + "." + month + "." + year}
                                                            format="DD.MM.YYYY">
      <span className="glyphicon glyphicon-calendar" aria-hidden="true"></span>
    </DateRangePicker>);
    buttons.push(<li key="admin" className="hiddenOnMobile"><a
      onClick={this.openAdminInterface}><span className="glyphicon glyphicon-edit" aria-hidden="true"></span></a></li>);

    return (
      <ul className="navbar-nav nav">
        {buttons}
      </ul>
    );
  }
});

module.exports = TopBar;