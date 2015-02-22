var React = require('react/addons');
var Dispatcher = require('./Dispatcher.js');
var MapStore = require('./MapStore.js');

"use strict";

var GalleryItem = React.createClass({
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
        var imagePath = "/image/" + this.props.id + "/thumb";
        return (
            <div>
              <img src={imagePath} />
            </div>
        );
    }
});

module.exports = GalleryItem;