var FileList = React.createClass({
    getInitialState: function() {
        return {
            items: [],
            index: 0,
            page: 1
        };
    },

    getItems: function (page, amount) {
        $.getJSON( "/admin/list?page=" + page + "&amount=" + amount, function( data ) {
          this.setState({
            items: data
          })
        }.bind(this));
    },

    showPage: function (page) {
        this.getItems(page, this.props.amount);
    },

    componentDidMount: function () {
        this.showPage(this.state.page);
    },

    componentWillUnmount: function () {

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
        var item, items;
        item = "";
        items = this.state.items.map(function(itemChild) {
            return (<FileListItem key={itemChild.id} index={itemChild.id} name={itemChild.name} lat={itemChild.lat} lon={itemChild.lon} date={itemChild.date} />);
        });

        var previousClass = React.addons.classSet({
            'previous': true,
            'disabled': this.state.page == 1
        });

        return (
            <div>
            <div className="list-group">
            {items}
            </div>
            <div>{item}</div>
            <nav>
              <ul className="pager">
                <li className={previousClass}><a href="#" onClick={this.prevPage}><span aria-hidden="true">&larr;</span> Older</a></li>
                <li className="next"><a href="#" onClick={this.nextPage}>Newer <span aria-hidden="true">&rarr;</span></a></li>
              </ul>
            </nav>
            </div>
            );
    }
});