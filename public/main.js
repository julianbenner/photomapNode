var React = require('react');

var FileList = require('./components/FileList.react');
var FileList = require('./components/MapView.react');

React.render(
  <FileList amount="5" />,
  document.getElementById('file-list')
);
React.render(
  <MapView />,
  document.getElementById('map')
);