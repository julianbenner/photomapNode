var $ = require('jquery');
var React = require('react/addons');
var ApplicationStore = require('./ApplicationStore.js');
var Dispatcher = require('./Dispatcher.js');
var classNames = require('classnames');

var Login = React.createClass({
  getInitialState: function () {
    return {
      user: "",
      password: "",
      loginUnsuccessful: false
    };
  },

  componentDidMount: function () {
  },

  componentWillUnmount: function () {
  },

  login: function () {
    $.ajax({
      url: "login",
      method: "POST",
      data: {
        username: this.state.user,
        password: this.state.password
      }
    }).done(data => { // assumes login was correct and we got a token
      Dispatcher.dispatch({
        eventName: 'logged-in',
        user: this.state.user,
        token: data
      });
      Dispatcher.dispatch({
        eventName: 'hide-overlay'
      });
    }).fail(() => {
      this.setState({
        loginUnsuccessful: true
      })
    });
  },

  handleUserChange: function (e) {
    this.setState({
      user: e.target.value
    })
  },

  handlePasswordChange: function (e) {
    this.setState({
      password: e.target.value
    })
  },

  handleKeyDown: function (e) {
    if (e.keyCode === 13) {
      this.login();
    }
  },

  render: function () {
    const message = this.state.loginUnsuccessful
      ? 'Wrong username or password!'
      : '';
    return (
      <div id="fileListContainer">
        <div>
          <label>Username:</label>
          <input type="text" onChange={this.handleUserChange} onKeyDown={this.handleKeyDown} name="username" autoFocus />
        </div>
        <div>
          <label>Password:</label>
          <input type="password" onChange={this.handlePasswordChange} onKeyDown={this.handleKeyDown} name="password"/>
        </div>
        <div>
          <input type="button" className="btn btn-primary" onClick={this.login} value="Log In"/>
        </div>
        {message}
      </div>
    );
  }
});

module.exports = Login;