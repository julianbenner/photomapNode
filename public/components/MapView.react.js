var React = require('react/addons');
require('mapbox.js');
var Marker = require('./Marker.react');
var Dispatcher = require('./Dispatcher.js');
var MapStore = require('./MapStore.js');

"use strict";

var MapView = React.createClass({
    getInitialState: function () {
        "use strict";
        return {
            markers: []
        };
    },

    componentDidMount: function () {
        "use strict";
        L.mapbox.accessToken = this.props.token;

        var map = this.map = L.mapbox.map(this.getDOMNode(), 'examples.map-i86nkdio')
            .setView([48.7, 9.05], 12);

        var that = this;
        map.on('moveend', function() {
            Dispatcher.dispatch({
                eventName: 'drag-map',
                bounds: that.getBounds()
            });
        });
        map.on('zoomend', function() {
            Dispatcher.dispatch({
                eventName: 'zoom-map',
                bounds: that.getBounds(),
                zoom: that.map.getZoom()
            });
        });

        MapStore.on('refresh-markers', this.refreshMarkers);      
        Dispatcher.dispatch({
            eventName: 'zoom-map',
            bounds: that.getBounds(),
            zoom: that.map.getZoom()
        });
    },

    componentWillUnmount: function () {
        "use strict";
        MapStore.removeListener('refresh-markers', this.refreshMarkers);
    },

    getBounds: function () {
        "use strict";
        var bounds = this.map.getBounds();
        return {
            lat_min:bounds._southWest.lat,
            lat_max:bounds._northEast.lat,
            lon_min:bounds._southWest.lng,
            lon_max:bounds._northEast.lng,
        };
    },

    refreshMarkers: function () {
        "use strict";
        this.setState({
            markers: MapStore.getMarkers()
        });
    },

    addMarker: function (lat, lon, size, text) {
        "use strict";
        this.setState({
            markers: this.state.markers.concat([{lat: lat, lon: lon, size: size, text: text, map: this.map}])
        });
    },

    render: function() {
        "use strict";
        var map = this.map;
        var marker = this.state.markers.map(function(i) {
            return i.map(function(j) {
                if(j.image_count > 0) {
                    return (<Marker lat={j.avg_lat} lon={j.avg_lon} size={(Math.log(j.image_count) + 5) * 7} text={j.image_count} map={map} />);
                } else {
                    return false;
                }
            });
        });

        return (
            <div id='map'>
                {marker}        
            </div>
        );
    }
});

module.exports = MapView;