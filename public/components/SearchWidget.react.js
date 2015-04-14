var React = require('react/addons');
var Dispatcher = require('./Dispatcher.js');
var MapStore = require('./MapStore.js');

"use strict";

var SearchWidget = React.createClass({
    getInitialState: function () {
        "use strict";
        return { value: "" };
    },

    componentDidMount: function () {
        "use strict";     

        var url = "https://maps.googleapis.com/maps/api/js?v=3&callback=onLoadGoogleApiCallback&sensor=false";
        var script = document.createElement('script');
        script.id = 'load_google_api';
        script.type = "text/javascript";
        script.src = url;
        document.body.appendChild(script);
    },

    componentWillUnmount: function () {
        "use strict";
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