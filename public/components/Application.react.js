var React = require('react/addons');
var Dispatcher = require('./Dispatcher.js');
var MapStore = require('./MapStore.js');
var Overlay = require('./Overlay.react');
var MapView = require('./MapView.react');

"use strict";

var Application = React.createClass({
    getInitialState: function () {
        "use strict";
        return {};
    },

    componentDidMount: function () {
    },

    componentWillUnmount: function () {
    },

    render: function() {
        "use strict";
        return (
            <div className="container" id="container-map">
            <MapView token={this.props.token} />
            <Overlay token={this.props.token} />
            </div>
        );
    }
});

module.exports = Application;