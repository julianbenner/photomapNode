var React = require('react');

$ = jQuery = require('jquery');
var bootstrap = require('bootstrap');

var Application = require('./components/Application.jsx');
var TopBar = require('./components/TopBar.jsx');

React.render(
  <Application token="pk.eyJ1IjoianVsaWFuYmVubmVyIiwiYSI6Imo3VGM4QVkifQ.69vtm3yG3cQWalRZM0tdYA" />,
  document.getElementById('app')
);

React.render(
  <TopBar />,
  document.getElementById('reactTopBar')
);