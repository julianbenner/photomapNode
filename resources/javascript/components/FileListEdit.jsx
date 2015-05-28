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

    let lat, lon;

    if ((typeof currentFile !== 'undefined') && newFile.id === currentFile.id) {
      const location = FileStore.getLocation();
      lat = location.lat;
      lon = location.lon;
    } else if (typeof newFile !== 'undefined') {
      lat = newFile.lat;
      lon = newFile.lon;
    }
    this.setState({
      selectedFile: newFile,
      lat: lat,
      lon: lon
    });
  },

  componentDidMount: function () {
    FileStore.on('change', this.getState);
    FileStore.on('files-changed', this.getState);
    FileStore.on('change', this.changeLocation);
  },

  componentWillUnmount: function () {
    FileStore.removeListener('change', this.getState);
    FileStore.removeListener('files-changed', this.getState);
    FileStore.removeListener('change', this.changeLocation);
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

  changeLocation: function () {
    /*const location = FileStore.getLocation();
    if (React.findDOMNode(this.refs.inputLat) != null) {
      React.findDOMNode(this.refs.inputLat).value = location.lat;
      React.findDOMNode(this.refs.inputLon).value = location.lon;
    }*/
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
              <input id="inputName" type="text" className="form-control" placeholder="File name" value={this.state.selectedFile.name}
                     ref="inputName" onChange={this.handleChange} />
            </div>
            <div id="latLonRow">
              <div id="latLonRowInput">
                <div className="input-group latLonRowInputInput">
                  <span className="input-group-addon editAddon">Lat</span>
                  <input id="inputLat" type="text" className="form-control" placeholder="Latitude" value={this.state.lat}
                         ref="inputLat" onChange={this.handleChange} />
                </div>
                <div className="input-group latLonRowInputInput">
                  <span className="input-group-addon editAddon">Lon</span>
                  <input id="inputLon" type="text" className="form-control" placeholder="Longitude" value={this.state.lon}
                         ref="inputLon" onChange={this.handleChange} />
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
              <input id="inputDate" type="text" className="form-control" placeholder="Date" value={this.state.selectedFile.date}
                     ref="inputDate" onChange={this.handleChange} />
            </div>
            <div className="editButtons">
              <button type="button" className="btn btn-primary" onClick={this.save}>Save</button>
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