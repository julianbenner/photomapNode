var React = require('react/addons');
var Dispatcher = require('./Dispatcher.js');
var MapStore = require('./MapStore.js');
require('./lib/l.control.geosearch.js');
require('./lib/l.geosearch.provider.google.js');

"use strict";

var SearchWidget = React.createClass({
    getInitialState: function () {
        "use strict";
        return { value: "" };
    },

    componentDidMount: function () {
        "use strict";     
        //MapStore.on('connection-trouble', this.showConnectionWarning);
        //MapStore.on('refresh-markers', this.hideConnectionWarning);
    },

    componentWillUnmount: function () {
        "use strict";
        //MapStore.removeListener('connection-trouble', this.showConnectionWarning);
        //MapStore.removeListener('refresh-markers', this.hideConnectionWarning);
    },

    search: function () {
        Dispatcher.dispatch({
            eventName: 'geosearch',
            query: this.state.value
        });
    },

    handleChange: function(event) {
        this.setState({value: event.target.value});
    },

    render: function() {
        "use strict";

        return (
            <li className="navbar-form" role="search" key="searchWidget">
    <span className="input-group add-on">
      <input type="text" className="form-control" placeholder="Search" name="srch-term" id="locationQuery" value={this.state.value} onChange={this.handleChange} ></input>
      <div className="input-group-btn">
        <button className="btn btn-default" onClick={this.search}><i className="glyphicon glyphicon-search"></i></button>
      </div>
    </span></li>
        );
    }
});

module.exports = SearchWidget;