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

        return (
            <a href="#" className={classes} onClick={this.toggleEdit}>
                {this.props.index} - {this.props.name}
            </a>
        );
    }
});

module.exports = FileListItem;