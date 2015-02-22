var React = require('react/addons');
var Dispatcher = require('./Dispatcher.js');
var MapStore = require('./MapStore.js');
var GalleryItem = require('./GalleryItem.react');
require('bootstrap');

"use strict";

var Gallery = React.createClass({
    getInitialState: function () {
        "use strict";
        return {
          images: []
        };
    },

    componentDidMount: function () {
        "use strict";
        MapStore.on('show-gallery', this.show);
        MapStore.on('refresh-gallery', this.refreshGallery);
    },

    componentWillUnmount: function () {
        "use strict";
        MapStore.removeListener('show-gallery', this.show);
        MapStore.removeListener('refresh-gallery', this.refreshGallery);
    },

    show: function () {
        "use strict";
        $(this.getDOMNode()).modal('toggle');
    },

    refreshGallery: function () {
        "use strict";
        this.setState({
          images: MapStore.getGallery()
        });
    },

    render: function() {
        "use strict";
        var images = [];
        images = this.state.images.map(function (image) {
          return (<GalleryItem id={image.id} key={image.id} />);
        });

        return (
            <div className="modal fade">
              <div classNameName="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                    <h4 className="modal-title">Modal title</h4>
                  </div>
                  <div className="modal-body">
                    {images}
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-default" data-dismiss="modal">Close</button>
                    <button type="button" className="btn btn-primary">Save changes</button>
                  </div>
                </div>
              </div>
            </div>
        );
    }
});

module.exports = Gallery;