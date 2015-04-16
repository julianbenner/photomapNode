var React = require('react/addons');
require('mapbox.js');
var Marker = require('./Marker.jsx');
var Dispatcher = require('./Dispatcher.js');
var FileStore = require('./FileStore.js');

"use strict";

var LocationChooser = React.createClass({
    getInitialState: function () {
        "use strict";
        return {
            initialized: false // determines whether the map has been slid out yet
        };
    },

    componentDidMount: function () {
        "use strict";
        L.mapbox.accessToken = this.props.token;

        FileStore.on('toggle-location-chooser', this.toggle);
    },

    componentWillUnmount: function () {
        "use strict";
        FileStore.removeListener('toggle-location-chooser', this.toggle);
    },

    setLocation: function (lat, lon) {
        "use strict";
        Dispatcher.dispatch({
            eventName: 'change-location',
            lat: lat,
            lon: lon
        });
    },

    toggle: function () {
        var thisComponent = this;
        $(this.getDOMNode()).slideToggle("fast", function () {
            if (!thisComponent.state.initialized) {
                var map = thisComponent.map = L.mapbox.map(thisComponent.getDOMNode(), 'examples.map-i86nkdio')
                    .setView([thisComponent.props.lat, thisComponent.props.lon], 12);

                map.on('click', function(e) {
                    thisComponent.setLocation(e.latlng.lat, e.latlng.lng);
                });

                thisComponent.setState({
                    initialized: true
                });
            }
        });
    },

    render: function() {
        "use strict";
        var map = this.map;

        return (
            <div id='locationChooser'></div>
        );
    }
});

module.exports = LocationChooser;