var React = require('react/addons');
var Dispatcher = require('./Dispatcher.js');
var MapStore = require('./MapStore.js');
var FolderWidgetFolder = require('./FolderWidgetFolder.react');

"use strict";

var FolderWidget = React.createClass({
    getInitialState: function () {
        "use strict";
        return { };
    },

    componentDidMount: function () {
        "use strict";     
    },

    componentWillUnmount: function () {
        "use strict";
    },

    toggleList: function(event) {
        $("#folderDropdown").slideToggle();
    },

    render: function() {
        "use strict";

        return (
            <li><a className="dropdown-toggle" onClick={this.toggleList}>Folders</a>
            <ul id="folderDropdown" className="dropdown-menu">
              <FolderWidgetFolder root="images" indent="0" />
            </ul></li>
        );
    }
});

module.exports = FolderWidget;