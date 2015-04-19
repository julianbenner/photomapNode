'use strict';
var React = require('react/addons');
var Dispatcher = require('./Dispatcher.js');
var MapStore = require('./MapStore.js');

class DateRangePicker extends React.Component {
  constructor() {
    super();
    this.state = {};
  }
  // ...
  render() {
    return (
      <li><a className="dropdown-toggle" onClick={this.toggleList}><span className="glyphicon glyphicon-calendar" aria-hidden="true"></span><span className="navItemTitle">Date</span></a>
        <ul id="folderDropdown" className="dropdown-menu folder">
        </ul>
      </li>
    );
  }
}
module.exports = DateRangePicker;