"use strict";
var React = require('react/addons');
var FileStore = require('./FileStore.js');
var ApplicationStore = require('./ApplicationStore.js');
var Dispatcher = require('./Dispatcher.js');
var Dropzone = require('./Dropzone');

var FileUploadForm = React.createClass({
  getInitialState: function () {
    return {
      dbid: 0,
      name: null,
      lat: 0.0,
      lon: 0.0,
      date: ''
    };
  },

  componentDidMount: function () {
  },

  componentWillUnmount: function () {
  },

  uploadFile: function () {
    const formData = new FormData();
    formData.append("fileInput", document.getElementById("fileInput").files[0]);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/admin/upload");
    xhr.setRequestHeader("token", ApplicationStore.getLoginToken());
    xhr.send(formData);
  },

  onDrop: function (files) {
    const formData = new FormData();
    files.map(function(file) { formData.append("fileInput", file); });

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/admin/upload");
    xhr.setRequestHeader("token", ApplicationStore.getLoginToken());
    xhr.send(formData);
  },

  render: function () {
    return (
      <div>
        <Dropzone onDrop={this.onDrop}>
          <div>Drop files here or click to open the file chooser</div>
        </Dropzone>
        <button id="fileUpload" name="fileUpload" onClick={this.uploadFile} className="btn">Upload</button>
      </div>
    );
  }
});

module.exports = FileUploadForm;