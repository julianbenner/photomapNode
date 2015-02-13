var React = require('react');
var FileStore = require('./FileStore.js');
var Dispatcher = require('./Dispatcher.js');

var FileListItem = React.createClass({
    getInitialState: function() {
        return {
            name: '',
            lat: 0.0,
            lon: 0.0,
            date: '',
            editIsVisible: false
        };
    },

    componentDidMount: function () {
        this.setState({
            name: this.props.name,
            lat: this.props.lat,
            lon: this.props.lon,
            date: this.props.date,
        });
    },

    componentWillUnmount: function () {

    },

    toggleEdit: function () {
        Dispatcher.dispatch({
            eventName: 'select-file',
            fileIndex: this.props.index
        });
    },

    render: function() {

        var editStyle = {
            'visibility': this.props.selected ? 'visible' : 'hidden',
            'position': this.props.selected ? 'static' : 'absolute'
        };

        return (
            <div className="list-group-item" onClick={this.toggleEdit}>
                {this.props.index} - {this.state.name}
                <div style={editStyle}><br />
                  <div className="input-group">
                      <span className="input-group-addon">File</span>
                      <input type="text" className="form-control" placeholder="File name" value={this.state.name} />
                  </div>
                  <div className="input-group">
                      <span className="input-group-addon">Lat</span>
                      <input type="text" className="form-control" placeholder="Latitude" value={this.state.lat} />
                  </div>
                  <div className="input-group">
                      <span className="input-group-addon">Lon</span>
                      <input type="text" className="form-control" placeholder="Longitude" value={this.state.lon} />
                  </div>
                  <div className="input-group">
                      <span className="input-group-addon">Date</span>
                      <input type="text" className="form-control" placeholder="Date" value={this.state.date} />
                  </div>
                </div>
            </div>
        );
    }
});

module.exports = FileListItem;