var React = require('react/addons');
var L = require('leaflet');
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
        this.setState({
            marker: L.marker([this.props.lat, this.props.lon], {
                icon: L.divIcon({
                    html: '<div class="image_count_child">' + this.props.text + '</div>',
                    iconSize: [this.props.size, this.props.size],
                    className: 'image_count'
                })
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