var FileListItem = require('./FileListItem.react');
var FileListEdit = require('./FileListEdit.react');
var $ = require('jquery');
var React = require('react/addons');
var MapStore = require('./MapStore.js');
var FileStore = require('./FileStore.js');
var Dispatcher = require('./Dispatcher.js');

var FileList = React.createClass({
    getInitialState: function() {
        return {
            items: [],
            currently_selected: 0,
            page: 1,
            amount_of_pages: 1
        };
    },

    componentDidMount: function () {
        FileStore.on('files-changed', this.filesChanged);
        Dispatcher.dispatch({
            eventName: 'load-files',
            fileIndex: this.props.preselected
        });
    },

    componentWillUnmount: function () {
        FileStore.removeListener('files-changed', this.filesChanged);
    },

    filesChanged: function () {
        this.setState({
            page: FileStore.getSelectedFilePage()
        }, function () {
            this.showPage();
        });
    },

    showPage: function () {
        var pageContent = FileStore.getPageContent(this.state.page);
        this.setState({
            items: pageContent,
            amount_of_pages: FileStore.getAmountOfPages()
        });
    },

    prevPage: function () {
        if(this.state.page > 1) {
            this.setState({
                page: this.state.page-1
            }, function() {
                this.showPage(this.state.page);
            });
        }
    },

    nextPage: function () {
        this.setState({
            page: this.state.page+1
        }, function() {
            this.showPage(this.state.page);
        });
    },

    selectItem: function () {

    },

    render: function() {
        var items = this.state.items.map(function(itemChild) {
            return (<FileListItem index={itemChild.id} name={itemChild.name} lat={itemChild.lat} lon={itemChild.lon} date={itemChild.date} selected={itemChild.selected} />);
        });

        var previousClass = React.addons.classSet({
            'disabled': this.state.page == 1
        });

        return (
            <div>
                <nav>
                  <ul className="pagination">
                    <li className={previousClass}>
                        <a href="#" onClick={this.prevPage}>
                            <span aria-hidden="true">&larr;</span>
                        </a>
                    </li>
                    <li><span>{this.state.page + '/' + this.state.amount_of_pages}</span></li>
                    <li className="next">
                        <a href="#" onClick={this.nextPage}>
                            <span aria-hidden="true">&rarr;</span>
                        </a>
                    </li>
                  </ul>
                </nav>
                <div className="list-group">
                    {items}
                </div>
                <FileListEdit />
            </div>
            );
    }
});

module.exports = FileList;