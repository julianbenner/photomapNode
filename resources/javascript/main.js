var React = require('react');

$ = jQuery = require('jquery');
var bootstrap = require('bootstrap');

var Application = require('./components/Application.jsx');
var TopBar = require('./components/TopBar.jsx');

var config = require('./config_client');

React.render(
  <Application token={config.token} />,
  document.getElementById('app')
);

React.render(
  <TopBar token={config.token} />,
  document.getElementById('reactTopBar')
);