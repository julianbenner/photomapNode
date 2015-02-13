var React = require('react');

var FileList = require('./components/FileList.react');

React.render(
  <FileList amount="5" />,
  document.getElementById('file-list')
);