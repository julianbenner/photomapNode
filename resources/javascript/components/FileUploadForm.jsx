"use strict";
var React = require('react/addons');
var FileStore = require('./FileStore.js');
var ApplicationStore = require('./ApplicationStore.js');
var Dispatcher = require('./Dispatcher.js');
var Dropzone = require('./Dropzone');
var classNames = require('classnames');

function getFolderStructure() {
  return {
    folderStructure: FileStore.getFolderStructure()
  };
}

var FileUploadForm = React.createClass({
  getInitialState: function () {
    return {
      progress: 0,
      error: false,
      finished: false,
      message: '',
      folderStructure: FileStore.getFolderStructure()
    };
  },

  componentDidMount: function () {
    FileStore.on('change', this.updateFolderList);
  },

  componentWillUnmount: function () {
    FileStore.on('change', this.updateFolderList);
  },

  updateFolderList: function () {
    this.setState(getFolderStructure());
  },

  updateProgress: function (e) {
    if (e.lengthComputable) {
      this.setState({
        progress: e.loaded / e.total
      });
    }
  },

  transferFailed: function (e) {
    this.setState({
      error: true
    });
  },

  transferComplete: function (e) {
    if (e.target.status != 200)
      this.setState({
        error: true,
        message: e.target.responseText
      });
    else {
      this.setState({
        finished: true
      });
      Dispatcher.dispatch({
        eventName: 'load-files'
      });
    }
  },

  herp: function () {
    FileStore.getSelectedFolder();
  },

  onDrop: function (files) {
    const formData = new FormData();
    files.map(function(file) { formData.append("fileInput", file); });

    this.setState({ error: false, finished: false, message: "" });
    const xhr = new XMLHttpRequest();
    xhr.upload.addEventListener("progress", this.updateProgress, false);
    xhr.addEventListener("load", this.transferComplete, false);
    xhr.addEventListener("error", this.transferFailed, false);
    xhr.open("POST", "/admin/upload");
    xhr.setRequestHeader("token", ApplicationStore.getLoginToken());
    xhr.setRequestHeader("folder", FileStore.getSelectedFolder().name);
    xhr.send(formData);
  },

  render: function () {
    const progressStyle = {
      width: Math.round(this.state.progress*100) + '%'
    };
    const progressClasses = classNames({
      "progress-bar": true,
      "progress-bar-success": this.state.finished && !this.state.error,
      "progress-bar-danger": this.state.error
    });
    const content = this.state.folderStructure.toJSX();
    return (
      <div>
        <Dropzone onDrop={this.onDrop} width="100%">
          <div>Drop files here or click to open the file chooser</div>
        </Dropzone>
        <div>{this.state.message}</div>
        <div className="progress">
          <div className={progressClasses} role="progressbar" style={progressStyle} />
        </div>
<button className="btn" value="herp" onClick={this.herp} />
        {content}
      </div>
    );
  }
});

module.exports = FileUploadForm;