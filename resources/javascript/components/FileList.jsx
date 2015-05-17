var FileListItem = require('./FileListItem.jsx');
var FileListEdit = require('./FileListEdit.jsx');
var FileUploadForm = require('./FileUploadForm.jsx');
var $ = require('jquery');
var React = require('react/addons');
var MapStore = require('./MapStore.js');
var FileStore = require('./FileStore.js');
var Dispatcher = require('./Dispatcher.js');
var classNames = require('classnames');

var FileList = React.createClass({
  getInitialState: function () {
    return {
      currently_selected: 0,
      page: 1
    };
  },

  componentDidMount: function () {
    this.getState();
    FileStore.on('change', this.getState);
    Dispatcher.dispatch({
      eventName: 'load-files',
      fileIndex: this.props.preselected
    });
  },

  componentWillUnmount: function () {
    FileStore.removeListener('change', this.getState);
  },

  getState: function () {
    this.setState({
      items: FileStore.getCurrentPageContent(),
      page: FileStore.getPage(),
      amountOfPages: FileStore.getAmountOfPages()
    });
  },

  prevPage: function () {
    Dispatcher.dispatch({
      eventName: 'files-prev-page'
    })
  },

  nextPage: function () {
    Dispatcher.dispatch({
      eventName: 'files-next-page'
    })
  },

  triggerFullScan: function () {
    Dispatcher.dispatch({
      eventName: 'files-full-scan'
    })
  },

  sortFiles: function (mode) {
    Dispatcher.dispatch({
      eventName: 'files-sort',
      sort: mode
    })
  },

  sortNoLocAsc: function () {
    this.sortFiles('no-loc-asc');
  },
  sortNoLocDesc: function () {
    this.sortFiles('no-loc-desc');
  },
  sortIdAsc: function () {
    this.sortFiles('id-asc');
  },
  sortIdDesc: function () {
    this.sortFiles('id-desc');
  },

  render: function () {
    const items = typeof this.state.items === 'undefined' ? [] : this.state.items.map((itemChild) => {
      return (<FileListItem index={itemChild.id} key={itemChild.id} name={itemChild.name} lat={itemChild.lat}
                            lon={itemChild.lon} date={itemChild.date} selected={itemChild.selected}/>);
    });

    const previousClass = classNames({
      'disabled': this.state.page === 1
    });
    const nextClass = classNames({
      'disabled': this.state.page === this.state.amountOfPages
    });

    return (
      <div id="fileListContainer">
        <div className="col-xs-6">
          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title">Browse</h3>
            </div>
            <div className="panel-body">
              <nav>
                <ul className="pagination">
                  <li className={previousClass}>
                    <a href="#" onClick={this.prevPage}>
                      <span aria-hidden="true">&larr;</span>
                    </a>
                  </li>
                  <li><span>{this.state.page + '/' + this.state.amountOfPages}</span></li>
                  <li className={nextClass}>
                    <a href="#" onClick={this.nextPage}>
                      <span aria-hidden="true">&rarr;</span>
                    </a>
                  </li>
                </ul>
              </nav>
              <div className="btn-toolbar" role="toolbar">
                <div className="btn-group" role="group">
                  <button type="button" className="btn btn-default" disabled="disabled">No location</button>
                  <button type="button" className="btn btn-default" onClick={this.sortNoLocDesc}><span className="glyphicon glyphicon-triangle-top"></span></button>
                  <button type="button" className="btn btn-default" onClick={this.sortNoLocAsc}><span className="glyphicon glyphicon-triangle-bottom"></span></button>
                </div>
                <div className="btn-group" role="group">
                  <button type="button" className="btn btn-default" disabled="disabled">ID</button>
                  <button type="button" className="btn btn-default" onClick={this.sortIdDesc}><span className="glyphicon glyphicon-triangle-top"></span></button>
                  <button type="button" className="btn btn-default" onClick={this.sortIdAsc}><span className="glyphicon glyphicon-triangle-bottom"></span></button>
                </div>
              </div>
              <div className="list-group">
                {items}
              </div>
            </div>
          </div>
        </div>

        <div className="col-xs-6" id="fileListEditColumn">
          <FileListEdit token={this.props.token}/>

          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title">Add files</h3>
            </div>
            <div className="panel-body">
              <FileUploadForm />
              <button type="button" className="btn btn-default" onClick={this.triggerFullScan}>Scan</button>
            </div>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = FileList;