"use strict";
var React = require('react/addons');
var Dispatcher = require('./Dispatcher.js');
var MapStore = require('./MapStore.js');
var DateRangePicker = require('react-bootstrap-daterangepicker');
var SearchWidget = require('./SearchWidget.jsx');
var FolderWidget = require('./FolderWidget.jsx');

var TopBar = React.createClass({
  getInitialState: function () {
    return {
      connectionWarningVisible: false
    };
  },

  componentDidMount: function () {
    MapStore.on('connection-trouble', this.showConnectionWarning);
    MapStore.on('refresh-markers', this.hideConnectionWarning);
  },

  componentWillUnmount: function () {
    MapStore.removeListener('connection-trouble', this.showConnectionWarning);
    MapStore.removeListener('refresh-markers', this.hideConnectionWarning);
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
    this.setState({
      connectionWarningVisible: true
    });
  },

  hideConnectionWarning: function () {
    this.setState({
      connectionWarningVisible: false
    });
  },

  render: function () {
    const currentDate = new Date();
    const day = currentDate.getDate();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    const buttons = [];

    buttons.push(<SearchWidget key="searchWidget"/>);
    buttons.push(<FolderWidget key="folderWidget"/>);
    buttons.push(<li key="dateRangePicker"><DateRangePicker onApply={this.changeDate} onCancel={this.cancelDate}
                                                            startDate="01.01.1970"
                                                            endDate={day + "." + month + "." + year}
                                                            format="DD.MM.YYYY">
      <span className="glyphicon glyphicon-calendar" aria-hidden="true"></span>
    </DateRangePicker></li>);

    if (this.state.connectionWarningVisible) {
      buttons.push(<li key="connectionWarning">
        <div>Sorry, connection trouble</div>
      </li>);
    }

    return (
      <ul className="navbar-nav nav">
        {buttons}
      </ul>
    );
  }
});

module.exports = TopBar;