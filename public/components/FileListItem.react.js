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
        this.setState({
            editIsVisible: !this.state.editIsVisible
        });
    },

    render: function() {

        var editStyle = {
            'visibility': this.state.editIsVisible ? 'visible' : 'hidden',
            'position': this.state.editIsVisible ? 'static' : 'absolute'
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