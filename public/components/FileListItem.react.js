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
            'display': 'inline-block'
        };

        return (
            <a className="list-group-item" onClick={this.toggleEdit}>
                {this.state.name}
                <div style={editStyle}><br />
                  <input type="text" placeholder="File name" value={this.state.name} />
                  <input type="text" placeholder="Latitude" value={this.state.lat} />
                  <input type="text" placeholder="Longitude" value={this.state.lon} />
                  <input type="text" placeholder="Date" value={this.state.date} />
                </div>
            </a>
        );
    }
});