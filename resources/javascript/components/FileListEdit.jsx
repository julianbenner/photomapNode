"use strict";
var React = require('react/addons');
var FileStore = require('./FileStore.js');
var Dispatcher = require('./Dispatcher.js');
var LocationChooser = require('./LocationChooser.jsx');

var FileListEdit = React.createClass({
  getInitialState: function () {
    return {
      selectedFile: FileStore.getSelectedFile()
    };
  },

  getState: function () {
    const currentFile = this.state.selectedFile;
    const newFile = FileStore.getSelectedFile();

    let name, lat, lon, date;

    if ((typeof currentFile !== 'undefined') && (typeof newFile !== 'undefined') && newFile.id === currentFile.id) {
      const location = FileStore.getLocation();
      lat = location.lat;
      lon = location.lon;
      name = newFile.name;
      date = newFile.date;
    } else if (typeof newFile !== 'undefined' ) {
      lat = newFile.lat;
      lon = newFile.lon;
      name = newFile.name;
      date = newFile.date;
    }
    this.setState({
      selectedFile: newFile,
      name: name,
      lat: lat,
      lon: lon,
      date: date
    });
  },

  componentDidMount: function () {
    FileStore.on('change', this.getState);
    FileStore.on('files-changed', this.getState);
  },

  componentWillUnmount: function () {
    FileStore.removeListener('change', this.getState);
    FileStore.removeListener('files-changed', this.getState);
  },

  save: function () {
    Dispatcher.dispatch({
      eventName: 'edit-file',
      file: {
        id: this.state.selectedFile.id,
        name: React.findDOMNode(this.refs.inputName).value,
        lat: React.findDOMNode(this.refs.inputLat).value,
        lon: React.findDOMNode(this.refs.inputLon).value,
        date: React.findDOMNode(this.refs.inputDate).value
      }
    });
  },

  cancel: function () {
    this.setState(this.getInitialState(), () => {
      this.setState({
        name: this.state.selectedFile.name,
        date: this.state.selectedFile.date,
        lat: this.state.selectedFile.lat,
        lon: this.state.selectedFile.lon
      })
    })
  },

  delete: function () {
    Dispatcher.dispatch({
      eventName: 'delete-file',
      file: {
        id: this.state.selectedFile.id
      }
    });
  },

  toggleLocationChooser: function () {
    Dispatcher.dispatch({
      eventName: 'toggle-location-chooser'
    });
  },

  handleChange: function (event) {
    switch (event.target.id) {
      case "inputName":
        this.setState({name: event.target.value});
        break;
      case "inputLat":
        this.setState({lat: event.target.value});
        break;
      case "inputLon":
        this.setState({lon: event.target.value});
        break;
      case "inputDate":
        this.setState({date: event.target.value});
        break;
    }
  },

  render: function () {
    let content1;
    if (typeof this.state.selectedFile === 'undefined') {
      content1 = <div>No file selected</div>;
    } else {
      content1 = (

      <div className="panel panel-default">
        <div className="panel-heading">
          <h3 className="panel-title">Edit {this.state.selectedFile.name}</h3>
        </div>
        <div className="panel-body">
          <div id="fileListEdit">
            <div className="input-group editInputGroup">
              <span className="input-group-addon editAddon">File</span>
              <input id="inputName" type="text" className="form-control" placeholder="File name" value={this.state.name}
                     ref="inputName" onChange={this.handleChange} />
            </div>
            <div id="latLonRow">
              <div id="latLonRowInput">
                <div className="input-group latLonRowInputInput">
                  <span className="input-group-addon editAddon">Lat</span>
                  <input id="inputLat" type="number" min="-90" max="90" step="0.00001" className="form-control"
                         placeholder="Latitude" value={this.state.lat} ref="inputLat" onChange={this.handleChange} />
                </div>
                <div className="input-group latLonRowInputInput">
                  <span className="input-group-addon editAddon">Lon</span>
                  <input id="inputLon" type="number" min="-180" max="180" step="0.00001" className="form-control"
                         placeholder="Longitude" value={this.state.lon} ref="inputLon" onChange={this.handleChange} />
                </div>
              </div>
              <div id="latLonRowButton" className="input-group-addon" onClick={this.toggleLocationChooser}>
                <span className="glyphicon glyphicon-map-marker"></span>
              </div>
              <div className="clearBoth"></div>
            </div>
            <LocationChooser token={this.props.token} lat={this.state.selectedFile.lat} lon={this.state.selectedFile.lon} />

            <div className="input-group editInputGroup">
              <span className="input-group-addon editAddon">Date</span>
              <input id="inputDate" type="datetime" className="form-control" placeholder="Date"
                     value={this.state.date} ref="inputDate" onChange={this.handleChange} />
            </div>
            <div className="editButtons">
              <button type="button" className="btn btn-primary" onClick={this.save}>Save</button>
              <button type="button" className="btn" onClick={this.cancel}>Cancel</button>
              <button type="button" className="btn btn-danger" onClick={this.delete}>Delete</button>
            </div>
          </div>
        </div>
      </div>
        );
    }
    return content1;
  }
});

module.exports = FileListEdit;