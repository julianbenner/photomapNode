var React = require('react');

var FileList = require('./components/FileList.react');
var MapView = require('./components/MapView.react');

React.render(
  <MapView />,
  document.getElementById('container-map')
);

React.render(
  <FileList amount="5" />,
  document.getElementById('file-list')
);