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
        var classes = React.addons.classSet({
            'list-group-item': true,
            'active': this.props.selected
        });

        return (
            <a href="#" className={classes} onClick={this.toggleEdit}>
                {this.props.index} - {this.state.name}
            </a>
        );
    }
});

module.exports = FileListItem;