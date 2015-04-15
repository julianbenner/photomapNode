var React = require('react/addons');
var Dispatcher = require('./Dispatcher.js');
var MapStore = require('./MapStore.js');
var DateRangePicker = require('react-bootstrap-daterangepicker');
var SearchWidget = require('./SearchWidget.react');
var FolderWidget = require('./FolderWidget.react');

"use strict";

var TopBar = React.createClass({
    getInitialState: function () {
        "use strict";
        return {
            connectionWarningVisible: false
        };
    },

    componentDidMount: function () {
        "use strict";     
        MapStore.on('connection-trouble', this.showConnectionWarning);
        MapStore.on('refresh-markers', this.hideConnectionWarning);
    },

    componentWillUnmount: function () {
        "use strict";
        MapStore.removeListener('connection-trouble', this.showConnectionWarning);
        MapStore.removeListener('refresh-markers', this.hideConnectionWarning);
    },

    changeDate: function (event, picker) {
        "use strict";   
        console.log(picker.startDate);     
        Dispatcher.dispatch({
            eventName: 'change-date',
            startDate: picker.startDate,
            endDate: picker.endDate
        });
    },

    cancelDate: function (event, picker) {
        "use strict";   
        console.log(picker.startDate);     
        Dispatcher.dispatch({
            eventName: 'change-date',
            startDate: null,
            endDate: null
        });
    },

    showConnectionWarning: function () {
        "use strict";
        this.setState({
            connectionWarningVisible: true
        });
    },

    hideConnectionWarning: function () {
        "use strict";
        this.setState({
            connectionWarningVisible: false
        });
    },

    render: function() {
        "use strict";

        var currentDate = new Date();
        var day = currentDate.getDate();
        var month = currentDate.getMonth() + 1;
        var year = currentDate.getFullYear();
        var buttons = [];

        buttons.push(<li key="dateRangePicker"><DateRangePicker onApply={this.changeDate} onCancel={this.cancelDate} startDate="01.01.1970" endDate={day + "." + month + "." + year} format="DD.MM.YYYY">Date</DateRangePicker></li>);
        buttons.push(<SearchWidget key="searchWidget" />);
        buttons.push(<FolderWidget key="folderWidget" />);

        if (this.state.connectionWarningVisible) {
            buttons.push(<li key="connectionWarning"><div>Sorry, connection trouble</div></li>);
        }

        return (
            <ul className="navbar-nav nav">
                {buttons}        
            </ul>
        );
    }
});

module.exports = TopBar;