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
          displayImage: false,
          images: [],
          image: 0
        };
    },

    componentDidMount: function () {
        "use strict";
        MapStore.on('select-image', this.selectImage);
        MapStore.on('show-gallery', this.showGallery);
        MapStore.on('refresh-gallery', this.refreshGallery);
    },

    componentWillUnmount: function () {
        "use strict";
        MapStore.removeListener('select-image', this.selectImage);
        MapStore.removeListener('show-gallery', this.showGallery);
        MapStore.removeListener('refresh-gallery', this.refreshGallery);
    },

    selectImage: function () {
        "use strict";
        this.setState({
          displayImage: true,
          image: MapStore.getSelectedImage()
        });
    },

    showGallery: function () {
        "use strict";
        this.setState({
          displayImage: false
        });
        $(this.getDOMNode()).modal('show');
    },

    refreshGallery: function () {
        "use strict";
        this.setState({
          images: MapStore.getGallery()
        });
    },

    render: function() {
        "use strict";
        var content, title;
        if (this.state.displayImage) {
          var path = "/image/" + this.state.image;
          content = (<img src={path} />);
          title = "Image " + this.state.image;
        } else {
          content = this.state.images.map(function (thumb) {
            return (<GalleryItem id={thumb.id} key={thumb.id} />);
          });
          title = "Gallery";
        }

        return (
            <div className="modal fade">
              <div className="modal-dialog large_modal">
                <div className="modal-content">
                  <div className="modal-header">
                    <button type="button" className="close" onClick={this.showGallery}><span aria-hidden="true">Gallery</span></button>
                    <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                    <h4>{title}</h4>
                  </div>
                  <div className="modal-body">
                    {content}
                  </div>
                </div>
              </div>
            </div>
        );
    }
});

module.exports = Gallery;