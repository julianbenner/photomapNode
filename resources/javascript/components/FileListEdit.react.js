var React = require('react');
var FileStore = require('./FileStore.js');
var Dispatcher = require('./Dispatcher.js');
var LocationChooser = require('./LocationChooser.react');

var FileListEdit = React.createClass({
    getInitialState: function() {
        return {
            dbid: 0,
            name: null,
            lat: 0.0,
            lon: 0.0,
            date: ''
        };
    },

    componentDidMount: function () {
        FileStore.on('files-changed', this.loadContent);
        FileStore.on('location-changed', this.changeLocation);
    },

    componentWillUnmount: function () {
        FileStore.removeListener('files-changed', this.loadContent);
        FileStore.removeListener('location-changed', this.changeLocation);
    },


    loadContent: function () {
        var currently_selected = FileStore.getSelectedFile();
        if (typeof currently_selected !== 'undefined')
            this.setState({
                dbid: currently_selected.id,
                name: currently_selected.name,
                lat: currently_selected.lat,
                lon: currently_selected.lon,
                date: currently_selected.date
            });
    },

    handleChange: function (event) {
        switch (event.target.id) {
            case "inputName":
                this.setState({name: event.target.value}); break;
            case "inputLat":
                this.setState({lat: event.target.value}); break;
            case "inputLon":
                this.setState({lon: event.target.value}); break;
            case "inputDate":
                this.setState({date: event.target.value}); break;
        }
    },

    save: function () {
        Dispatcher.dispatch({
            eventName: 'edit-file',
            file: {
                id: this.state.dbid,
                name: this.state.name,
                lat: this.state.lat,
                lon: this.state.lon,
                date: this.state.date
            }
        });
    },

    toggleLocationChooser: function () {
      Dispatcher.dispatch({
          eventName: 'toggle-location-chooser'
      });
    },

    changeLocation: function () {
      var location = FileStore.getLocation();
      this.setState({
        lat: location.lat,
        lon: location.lon
      });
    },

    render: function() {
        var content;

        if (this.state.name === null) {
            return <div>No file selected</div>;
        } else {
            return (
            <div id="fileListEdit">
                <span>{this.state.dbid}</span>
              <div className="input-group">
                  <span className="input-group-addon">File</span>
                  <input id="inputName" type="text" className="form-control" placeholder="File name" value={this.state.name} onChange={this.handleChange} />
              </div>
              <div id="latLonRow">
                <div id="latLonRowInput">
                  <div className="input-group" className="latLonRowInputInput">
                      <span className="input-group-addon">Lat</span>
                      <input id="inputLat"  type="text" className="form-control" placeholder="Latitude" value={this.state.lat} onChange={this.handleChange} />
                  </div>
                  <div className="input-group" className="latLonRowInputInput">
                      <span className="input-group-addon">Lon</span>
                      <input id="inputLon"  type="text" className="form-control" placeholder="Longitude" value={this.state.lon} onChange={this.handleChange} />
                  </div>
                </div>
                <div id="latLonRowButton" className="input-group-addon" onClick={this.toggleLocationChooser}>
                  <span className="glyphicon glyphicon-map-marker"></span>
                </div>
                <div className="clearBoth"></div>
              </div>
              <LocationChooser token={this.props.token} lat={this.state.lat} lon={this.state.lon} />
              <div className="input-group">
                  <span className="input-group-addon">Date</span>
                  <input id="inputDate"  type="text" className="form-control" placeholder="Date" value={this.state.date} onChange={this.handleChange} />
              </div>
              <button type="button" className="btn btn-primary" onClick={this.save}>Save</button>
            </div>);
        }
    }
});

module.exports = FileListEdit;