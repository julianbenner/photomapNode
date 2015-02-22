var React = require('react/addons');
var L = require('leaflet');
var Marker = require('./Marker.react');
var Dispatcher = require('./Dispatcher.js');

var MapView = React.createClass({
    getInitialState: function () {
        return {
            markers: []          
        };
    },

    componentDidMount: function () {
        var map = this.map = L.map(this.getDOMNode(), {
            minZoom: 2,
            maxZoom: 20,
            layers: [
                L.tileLayer(
                    'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                    {attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'})
            ],
            attributionControl: false,
        });

        map.fitWorld();

        "use strict";
        var wurst = this;
        map.on('moveend', function() {
            wurst.addMarker(Math.random(), 50, 50, '50');
        });

        this.setState({
            markers: [{lat: 50, lon: 50, size: 50, text: '50', map: this.map}]
        });
    },

    componentWillUnmount: function () {
    },

    addMarker: function (lat, lon, size, text) {
        "use strict";
        this.setState({
            markers: this.state.markers.concat([{lat: lat, lon: lon, size: size, text: text, map: this.map}])
        });
    },

    render: function() {
        var marker = this.state.markers.map(function(i) {
            return (<Marker lat={i.lat} lon={i.lon} size={i.size} text={i.text} map={i.map} />);
        });

        return (

            <div id='map'>
                {marker}        
            </div>
        );
    }
});

module.exports = MapView;