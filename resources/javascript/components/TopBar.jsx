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

  logOut: function () {
    Dispatcher.dispatch({
      eventName: 'logout'
    });
  },

  render: function () {
    const currentDate = new Date();
    const day = currentDate.getDate();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    const buttons = [];

    buttons.push(<FolderWidget key="folderWidget"/>);
    buttons.push(<DateRangePicker key="dateRangePicker" onApply={this.changeDate} onCancel={this.cancelDate} />);

    if (this.state.loggedIn !== true) {
      buttons.push(<li key="login" ref="loginButton" title="Log in"><a
        onClick={this.openLoginDialog}><span className="glyphicon glyphicon-log-in" aria-hidden="true"></span><span className="navbar-button-text">Log in</span></a></li>);
    } else {
      if (this.state.user === 'admin') {
        buttons.push(<li key="admin" ref="adminButton" title="Admin" className="hiddenOnMobile"><a
          onClick={this.openAdminInterface}><span className="glyphicon glyphicon-edit" aria-hidden="true"></span><span className="navbar-button-text">Admin</span></a>
        </li>);
      }
      buttons.push(<li key="logout" ref="logoutButton" title="Log out"><a
        onClick={this.logOut}><span className="glyphicon glyphicon-log-out" aria-hidden="true"></span><span className="navbar-button-text">Log out {this.state.user}</span></a></li>);
    }

    return (
      <div>
        <div className="container containerTopbar">
          <div id="logo">PhotoMap</div>
          <div className="searchHolder">
            <a className="btn-navbar-toggle navbar-hamburger">
              <span className="glyphicon glyphicon-menu-hamburger" data-toggle="collapse" data-target="#collapsable" />
            </a>
            <SearchWidget token={this.props.token} key="searchWidget"/>
          </div>

          <div className="navbar-header collapse buttonsTopbar" id="collapsable">
            <ul className="navbar-nav nav">
              {buttons}
            </ul>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = TopBar;