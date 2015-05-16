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
    // without delay, focus doesn't work
    window.setTimeout(() => {
      React.findDOMNode(this.refs.username).focus();
    }, 250);
  },

  componentWillUnmount: function () {
  },

  login: function () {
    $.ajax({
      url: "user/login",
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
      <div id="loginContainer">
        <div id="loginContainerChild">
          <div id="loginContainerChildChild">
            <div>
              <input className="form-control" type="text" placeholder="Username" onChange={this.handleUserChange} onKeyDown={this.handleKeyDown} name="username" ref="username" />
            </div>
            <div>
              <input className="form-control" type="password" placeholder="Password" onChange={this.handlePasswordChange} onKeyDown={this.handleKeyDown} name="password"/>
            </div>
            <div>
              <input type="button" className="btn btn-primary" onClick={this.login} value="Log In"/>
            </div>
            {message}
          </div>
        </div>
      </div>
    );
  }
});

module.exports = Login;