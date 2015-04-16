"use strict";
var React = require('react/addons');
var Dispatcher = require('./Dispatcher.js');
var MapStore = require('./MapStore.js');
var Gallery = require('./Gallery.jsx');
var GalleryImage = require('./GalleryImage.jsx');
var FileList = require('./FileList.jsx');
require('bootstrap');

var Overlay = React.createClass({
  getInitialState: function () {
    return {
      content: (<div />),
      mode: ""
    };
  },

  componentDidMount: function () {
    MapStore.on('update-overlay', this.updateOverlay);
    MapStore.on('show-overlay', this.showOverlay);
  },

  componentWillUnmount: function () {
    MapStore.removeListener('update-overlay', this.updateOverlay);
    MapStore.removeListener('show-overlay', this.showOverlay);
  },

  showOverlay: function () {
    $(this.getDOMNode()).modal('show');
  },

  hideOverlay: function () {
    $(this.getDOMNode()).modal('hide');
  },

  showGallery: function () {
    Dispatcher.dispatch({
      eventName: 'show-gallery'
    });
  },

  editImage: function () {
    Dispatcher.dispatch({
      eventName: 'edit-image'
    });
  },

  updateOverlay: function () {
    const mode = MapStore.getOverlayMode();

    this.setState({
      mode: mode
    });

    switch (mode) {
      case 'gallery':
        this.setState({
          content: (<Gallery />)
        });
        break;

      case 'image':
        this.setState({
          image: MapStore.getSelectedImage(),
          content: (<GalleryImage />)
        });
        break;

      case 'edit':
        this.setState({
          content: (<FileList token={this.props.token} preselected={MapStore.getSelectedImageId()}/>)
        });
        break;
    }
  },

  render: function () {
    const buttons = [];

    buttons.push(<div key="overlayClose" className="modal-control-btn modal-control-btn-right"
                      onClick={this.hideOverlay}>Close</div>);

    if (this.state.mode === 'image') {
      buttons.push(<div key="overlayGallery" className="modal-control-btn modal-control-btn-right"
                        onClick={this.showGallery}>Gallery</div>);
      buttons.push(<div key="overlayEdit" className="modal-control-btn modal-control-btn-left" onClick={this.editImage}>
        Edit</div>);
    } else if (this.state.mode === 'edit') {
      buttons.push(<div key="overlayGallery" className="modal-control-btn modal-control-btn-right"
                        onClick={this.showGallery}>Gallery</div>);
    }

    const cx = React.addons.classSet;
    const contentClasses = cx({
      'modal-content': true,
      'modal-content-dark': this.state.mode === 'gallery' || this.state.mode === 'image',
      'modal-content-bright': this.state.mode === 'edit'
    });

    return (
      <div className="modal fade">
        <div className="modal-control">
          {buttons}
        </div>
        <div className="modal-dialog large_modal">
          <div className="modal-intermediate">
            <div className={contentClasses}>
              <div className="modal-body">
                {this.state.content}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = Overlay;