var React = require('react/addons');
var Dispatcher = require('./Dispatcher.js');
var MapStore = require('./MapStore.js');
var DateRangePicker = require('react-bootstrap-daterangepicker');

"use strict";

var TopBar = React.createClass({
    getInitialState: function () {
        "use strict";
        return {};
    },

    componentDidMount: function () {
        "use strict";     
    },

    componentWillUnmount: function () {
        "use strict";
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

    render: function() {
        "use strict";

        var currentDate = new Date();
        var day = currentDate.getDate();
        var month = currentDate.getMonth() + 1;
        var year = currentDate.getFullYear();
        var buttons = [];
        buttons.push(<li><DateRangePicker onApply={this.changeDate} onCancel={this.cancelDate} startDate="01.01.1970" endDate={day + "." + month + "." + year} format="DD.MM.YYYY">Date</DateRangePicker></li>);

        return (
            <ul className="navbar-nav nav">
                {buttons}        
            </ul>
        );
    }
});

module.exports = TopBar;