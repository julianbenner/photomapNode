"use strict";
var React = require('react/addons');
var Dispatcher = require('./Dispatcher.js');
var MapStore = require('./MapStore.js');
var ApplicationStore = require('./ApplicationStore.js');
var DateRangePicker = require('./DateRangePicker.jsx');
var SearchWidget = require('./SearchWidget.jsx');
var FolderWidget = require('./FolderWidget.jsx');

function getApplicationState() {
  return {
    loggedIn: ApplicationStore.isLoggedIn(),
    user: ApplicationStore.getUser()
  };
}

var TopBar = React.createClass({
  propTypes: {
    token: React.PropTypes.string.isRequired
  },

  getInitialState: function () {
    return getApplicationState();
  },

  _onChange: function () {
    this.setState(getApplicationState());
  },

  componentDidMount: function () {
    ApplicationStore.on('change', this._onChange);
  },

  componentWillUnmount: function () {
    ApplicationStore.removeListener('change', this._onChange);
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

  openLoginDialog: function () {
    Dispatcher.dispatch({
      eventName: 'open-login-dialog'
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
    buttons.push(<DateRangePicker key="dateRangePicker" onApply={this.changeDate} onCancel={this.cancelDate}>
      <span className="glyphicon glyphicon-calendar" aria-hidden="true"></span>
    </DateRangePicker>);

    if (this.state.loggedIn !== true) {
      buttons.push(<li key="login"><a
        onClick={this.openLoginDialog}><span className="glyphicon glyphicon-log-in" aria-hidden="true"></span></a></li>);
    } else {
      if (this.state.user === 'admin') {
        buttons.push(<li key="admin" className="hiddenOnMobile"><a
          onClick={this.openAdminInterface}><span className="glyphicon glyphicon-edit" aria-hidden="true"></span></a>
        </li>);
      }
      buttons.push(<li key="logout"><a
        onClick={this.logOut}><span className="glyphicon glyphicon-log-out" aria-hidden="true"></span> Logged in as {this.state.user}</a></li>);
    }

    return (
      <ul className="navbar-nav nav">
        {buttons}
      </ul>
    );
  }
});

module.exports = TopBar;