var React = require('react');
var FileStore = require('./FileStore.js');
var Dispatcher = require('./Dispatcher.js');

var FileListItem = React.createClass({
    getInitialState: function() {
        return {};
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
        var aStyle = {
            backgroundColor: this.props.lon == '' || this.props.lon == null || this.props.lat == '' || this.props.lat == null ? '#fee' : ''
        };

        return (
            <a href="#" className={classes} style={aStyle} onClick={this.toggleEdit}>
                {this.props.index} - {this.props.name}
                <span className="small">{this.props.lat}, {this.props.lon}</span>
            </a>
        );
    }
});

module.exports = FileListItem;