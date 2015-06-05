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

  goToPage: function (page) {
    Dispatcher.dispatch({
      eventName: 'files-page',
      page: page
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

    const pagesBefore = [];
    const pagesAfter = [];

    const differenceToFirstPage = this.state.page - 1;
    const differenceToLastPage = this.state.amountOfPages - this.state.page;

    const generatePageButton = function(page) {
      return (<li>
        <a href="#" onClick={this.goToPage.bind(this, page)}>
          <span aria-hidden="true">{page}</span>
        </a>
      </li>);
    };

    if (differenceToFirstPage === 0) {
      // we are on page 1
    } else if (differenceToFirstPage <= 3) {
      // we are on pages 2, 3 or 4
      for (let i = 1; i <= differenceToFirstPage; i++) {
        pagesBefore.push(generatePageButton(i));
      }
    } else {
      // we are on pages 5 or higher
      pagesBefore.push(generatePageButton(1));
      pagesBefore.push(<li>
        <span aria-hidden="true">&hellip;</span>
      </li>);
      for (let i = this.state.page - 3; i < this.state.page; i++) {
        pagesBefore.push(generatePageButton(i));
      }
    }

    if (differenceToLastPage === 0) {
      // we are on last page
    } else if (differenceToLastPage <= 3) {
      for (let i = this.state.page + 1; i <= this.state.amountOfPages; i++) {
        pagesAfter.push(generatePageButton(i));
      }
    } else {
      // we are on pages 5 or higher
      for (let i = this.state.page + 1; i < this.state.page + 3; i++) {
        pagesAfter.push(generatePageButton(i));
      }
      pagesAfter.push(<li>
        <span aria-hidden="true">&hellip;</span>
      </li>);
      pagesAfter.push(generatePageButton(this.state.amountOfPages));
    }

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
                  {pagesBefore}
                  <li><span>{this.state.page + '/' + this.state.amountOfPages}</span></li>
                  {pagesAfter}
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
