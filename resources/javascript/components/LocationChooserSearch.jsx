"use strict";
var React = require('react/addons');
var Dispatcher = require('./Dispatcher.js');
var FileStore = require('./FileStore');
var classNames = require('classnames');

function getFileStoreState() {
  return {
    results: FileStore.getSearchResults()
  };
}

var LocationChooserSearch = React.createClass({
  propTypes: {
    token: React.PropTypes.string.isRequired
  },

  getInitialState: function () {
    return {
      resultsVisible: false,
      results: [],
      lastKeystroke: 0
    };
  },

  update: function () {
    this.setState(getFileStoreState());
  },

  componentDidMount: function () {
    FileStore.on('change', this.update);
  },

  componentWillUnmount: function () {
    FileStore.removeListener('change', this.update);
  },

  search: function () {
    Dispatcher.dispatch({
      eventName: 'geosearch_lc',
      token: this.props.token,
      query: React.findDOMNode(this.refs.search).value
    });
    this.setState({
      resultsVisible: false
    });
  },

  selectResult: function (lat, lon) {
    Dispatcher.dispatch({
      eventName: 'move-map_lc',
      lat: lat,
      lon: lon
    });
  },

  keypress: function (event) {
    if (event.key === 'Enter') { // as of React 0.13, keyCode is always 0 (?)
      this.search();
    }
  },

  handleChange: function () {
    if (React.findDOMNode(this.refs.search).value == '') {
      this.setState({
        results: []
      })
    } else {
      this.setState({
        lastKeystroke: Date.now()
      }, () => {
        setTimeout(() => {
          const difference = Date.now() - this.state.lastKeystroke;
          if (difference >= 200) {
            Dispatcher.dispatch({
              eventName: 'geosearch1_lc',
              token: this.props.token,
              query: React.findDOMNode(this.refs.search).value
            });
            this.setState({
              resultsVisible: true
            });
          }
        }, 250);
      });
    }
  },

  focusIn: function () {
    this.setState({
      resultsVisible: true
    });
  },

  focusOut: function () {
    setTimeout(() => {
      this.setState({
        resultsVisible: false
      });
    },100);
  },

  render: function () {
    const results = this.state.results.map(result => {
      const key = "" + result.lat + "." + result.lon;
      return <li onClick={this.selectResult.bind(this, result.lat, result.lon)} key={key} className="searchResult"><a>{result.name}</a></li>;
    });
    const style = classNames({
      'searchResults': true,
      'dropdown-menu': true,
      'searchResultsVisible': this.state.resultsVisible
    });

    return (
      <div className="searchWidget" role="search" key="searchWidget">
        <span className="input-group add-on">
          <input onKeyPress={this.keypress} onChange={this.handleChange} type="text" className="form-control" placeholder="Search"
                 id="locationQuery" value={this.state.value} ref="search" onFocus={this.focusIn} onBlur={this.focusOut}></input>
          <div className="input-group-btn">
            <button className="btn btn-default" onClick={this.search}><span className="glyphicon glyphicon-search"></span>
            </button>
          </div>
        </span>
        <ul className={style}>{results}</ul>
      </div>
    );
  }
});

module.exports = LocationChooserSearch;