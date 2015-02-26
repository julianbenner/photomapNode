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

        var buttons = [];
        buttons.push(<li><DateRangePicker onApply={this.changeDate} onCancel={this.cancelDate} startDate="1/1/2014" endDate="3/1/2014">Date</DateRangePicker></li>);

        return (
            <ul>
                {buttons}        
            </ul>
        );
    }
});

module.exports = TopBar;