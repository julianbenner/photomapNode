'use strict';
var Dispatcher = require('./Dispatcher.js');
var assign = require('object-assign');
var EventEmitter = require('events').EventEmitter;
var $ = require('jquery');

var CHANGE_EVENT = 'change';

var loggedIn = false;
var loginToken = '';
var user = '';

var ApplicationStore = assign({}, EventEmitter.prototype, {
  isLoggedIn: function() {
    return loggedIn;
  },

  getLoginToken: function() {
    return loginToken;
  },

  getUser: function() {
    return user;
  }
});

Dispatcher.register(function (payload) {
  switch (payload.eventName) {
    case 'logged-in':
      loggedIn = true;
      loginToken = payload.token;
      user = payload.user;
      ApplicationStore.emit(CHANGE_EVENT);
      break;
    case 'logout':
      loggedIn = false;
      loginToken = '';
      user = '';
      ApplicationStore.emit(CHANGE_EVENT);
      break;
  }

  return true;
});

module.exports = ApplicationStore;