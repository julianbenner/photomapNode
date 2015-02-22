var React = require('react');

var FileList = require('./components/FileList.react');
var MapView = require('./components/MapView.react');

React.render(
  <MapView token="pk.eyJ1IjoianVsaWFuYmVubmVyIiwiYSI6Imo3VGM4QVkifQ.69vtm3yG3cQWalRZM0tdYA" />,
  document.getElementById('container-map')
);

React.render(
  <FileList amount="5" />,
  document.getElementById('file-list')
);