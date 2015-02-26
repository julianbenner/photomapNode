var React = require('react');

var FileList = require('./components/FileList.react');
var Application = require('./components/Application.react');
var TopBar = require('./components/TopBar.react');

React.render(
  <Application token="pk.eyJ1IjoianVsaWFuYmVubmVyIiwiYSI6Imo3VGM4QVkifQ.69vtm3yG3cQWalRZM0tdYA" />,
  document.getElementById('app')
);

React.render(
  <TopBar />,
  document.getElementById('reactTopBar')
);

React.render(
  <FileList amount="5" />,
  document.getElementById('file-list')
);