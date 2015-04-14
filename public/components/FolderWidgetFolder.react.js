var React = require('react/addons');
var Dispatcher = require('./Dispatcher.js');
var MapStore = require('./MapStore.js');
var $ = require('jquery');

"use strict";

var FolderWidgetFolder = React.createClass({
    getInitialState: function () {
        "use strict";
        return {
            content: [],
            unfolded: false
        };
    },

    componentDidMount: function () {
        "use strict";  
        var thisComponent = this;
        $.getJSON("get_folder_content", {
            root: this.props.root
        }).done(function(data) {
            thisComponent.setState({
                content: data
            });
        });   
        if (this.props.indent === 0) {
            this.setState({
                unfolded: true
            });
        }
    },

    componentWillUnmount: function () {
        "use strict";
    },

    toggle: function(event) {
        this.setState({
            unfolded: !this.state.unfolded
        });
    },

    render: function() {
        "use strict";

        var thisComponent = this;
        var indent = Array(parseInt(this.props.indent) + 1).join("-");
        var name = thisComponent.props.root.split("/");
        var content = [(<li onClick={this.toggle}>{indent + name[name.length-1]}</li>)];
        if (this.state.unfolded)
            content = content.concat(this.state.content.map(function (item, i) {
                if (item.type == 'folder') {
                    var folderRoot = thisComponent.props.root + "/" + item.name;
                    return (<FolderWidgetFolder root={folderRoot} indent={parseInt(thisComponent.props.indent) + 1} />);
                } else {
                    return;//(<li key={i}>{item.name}</li>);
                }
            }));

        return (
            <div>{content}</div>
        );
    }
});

module.exports = FolderWidgetFolder;