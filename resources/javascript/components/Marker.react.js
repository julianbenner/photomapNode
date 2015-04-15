var React = require('react/addons');
require('mapbox.js');
var Dispatcher = require('./Dispatcher.js');

var Marker = React.createClass({
    getInitialState: function () {
        "use strict";
        return {
            marker: {}
        };
    },

    componentDidMount: function () {
        "use strict";
        var lat = this.props.lat;
        var lon = this.props.lon;
        this.setState({
            marker: L.marker([this.props.avg_lat, this.props.avg_lon], {
                icon: L.divIcon({
                    html: '<div class="image_count_child" data-toggle="modal" data-target="#myModal">' + this.props.text + '</div>',
                    iconSize: [this.props.size, this.props.size],
                    className: 'image_count'
                })
            }).on('click', function () {
                Dispatcher.dispatch({
                    eventName: 'show-gallery',
                    lat: lat,
                    lon: lon
                });
            })
        }, function () {
            this.state.marker.addTo(this.props.map)
        });
    },

    componentWillUnmount: function () {
        "use strict";
        this.props.map.removeLayer(this.state.marker);
    },

    render: function() {
        "use strict";
        return false;
    }
});

module.exports = Marker;