var React = require('react/addons');
var L = require('leaflet');
var Dispatcher = require('./Dispatcher.js');

var Marker = React.createClass({
    componentDidMount: function () {
        var marker = L.marker([this.props.lat, this.props.lon], {
            icon: L.divIcon({
                html: '<div class="image_count_child">' + this.props.text + '</div>',
                iconSize: [this.props.size, this.props.size],
                className: 'image_count'
            })
        });

        marker.addTo(this.props.map);
    },

    componentWillUnmount: function () {
    },

    render: function() {
        return false;
    }
});

module.exports = Marker;