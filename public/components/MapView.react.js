var React = require('react/addons');
var Leaflet = require('leaflet');
var Dispatcher = require('./Dispatcher.js');

var MapView = React.createClass({
    componentDidMount: function () {
L.mapbox.accessToken = 'pk.eyJ1IjoianVsaWFuYmVubmVyIiwiYSI6Imo3VGM4QVkifQ.69vtm3yG3cQWalRZM0tdYA';
// Replace 'examples.map-i87786ca' with your map id.
var mapboxTiles = L.tileLayer('https://{s}.tiles.mapbox.com/v4/examples.map-i87786ca/{z}/{x}/{y}.png?access_token=' + L.mapbox.accessToken, {
    attribution: '<a href="http://www.mapbox.com/about/maps/" target="_blank">Terms &amp; Feedback</a>'
});

var map = this.map = L.map(this.getDOMNode())
    .addLayer(mapboxTiles)
    .setView([42.3610, -71.0587], 15);
    },

    componentWillUnmount: function () {
    },

    render: function() {
        return (
            <div className='map'>asd</div>
        );
    }
});

module.exports = MapView;