"use strict";
var React = require('react/addons');
var Dispatcher = require('./Dispatcher.js');
var MapStore = require('./MapStore.js');
var OverlayStore = require('./OverlayStore.js');
var ApplicationStore = require('./ApplicationStore');
var Gallery = require('./Gallery.jsx');
var GalleryImage = require('./GalleryImage.jsx');
var FileList = require('./FileList.jsx');
var Login = require('./Login.jsx');
var classNames = require('classnames');
require('bootstrap');
var config = require('../config_client');

function getOverlayState() {
  return {
    mode: OverlayStore.getOverlayMode(),
    isVisible: OverlayStore.isVisible(),
    amountOfImages: OverlayStore.getGallery().length
  }
}

var Overlay = React.createClass({
  propTypes: {
    token: React.PropTypes.string.isRequired
  },

  getInitialState: function () {
    return {
      contentMode: 'empty',
      mode: "",
      title: ""
    };
  },

  componentDidMount: function () {
    MapStore.on('update-overlay', this.updateOverlay);
    OverlayStore.on('change', this._onChange);
    MapStore.on('show-overlay', this.showOverlay);
    document.addEventListener('keydown', this.onKeyDown);
  },

  componentWillUnmount: function () {
    MapStore.removeListener('update-overlay', this.updateOverlay);
    OverlayStore.removeListener('change', this._onChange);
    MapStore.removeListener('show-overlay', this.showOverlay);
    document.removeEventListener('keydown', this.onKeyDown);
  },

  _onChange: function () {
    this.setState(getOverlayState(), () => {
      if (this.state.isVisible) {
        $(React.findDOMNode(this)).modal('show');
        this.updateOverlay();
      } else {
        $(React.findDOMNode(this)).modal('hide');
      }
    });
  },

  onKeyDown: function (e) {
    switch (e.keyCode) {
      case 27: // ESC
        this.hideOverlay();
        break;
    }
  },

  showOverlay: function () {
    $(React.findDOMNode(this)).modal('show');
  },

  hideOverlay: function () {
    $(React.findDOMNode(this)).modal('hide');
  },

  showGallery: function () {
    Dispatcher.dispatch({
      eventName: 'show-gallery'
    });
  },

  downloadImage: function () {
    window.location.href = './' + config.imagePath + '/' + this.state.image.id + '/down';
  },

  editImage: function () {
    Dispatcher.dispatch({
      eventName: 'edit-image'
    });
  },

  triggerPrevImage: function () {
    Dispatcher.dispatch({
      eventName: 'prev-image'
    });
  },

  triggerNextImage: function () {
    Dispatcher.dispatch({
      eventName: 'next-image'
    });
  },

  updateOverlay: function () {
    switch (this.state.mode) {
      case 'gallery':
        this.setState({
          contentMode: 'gallery',
          title: 'Gallery'
        });
        break;

      case 'image':
        this.setState({
          image: OverlayStore.getSelectedImage(),
          contentMode: 'galleryImage'
        }, () => {
          if (this.state.image)
            this.setState({
              title: this.state.image.name
            });
        });
        break;

      case 'edit':
        const fileListMode = this.state.mode === 'image' // if mode was note image, we assume, there is no preselected file
          ? 'filelistPresel'
          : 'filelist';
        this.setState({
          contentMode: fileListMode,
          title: 'Editor'
        });
        break;

      case 'login':
        this.setState({
          contentMode: 'login',
          title: 'Login'
        });
        break;
    }

    this.showOverlay();
  },

  render: function () {
    const buttons = [];

    buttons.push(<div key="overlayClose" className="modal-control-btn modal-control-btn-right"
                      onClick={this.hideOverlay}><span className="glyphicon glyphicon-remove" aria-hidden="true"></span></div>);

    if (this.state.mode === 'image') {
      if (this.state.amountOfImages > 1)
        buttons.push(<div key="overlayGallery" className="modal-control-btn modal-control-btn-right"
                          onClick={this.showGallery}><span className="glyphicon glyphicon-th" aria-hidden="true"></span></div>);
      buttons.push(<div key="overlayDownload" className="modal-control-btn modal-control-btn-right"
                        onClick={this.downloadImage}><span className="glyphicon glyphicon-download" aria-hidden="true"></span></div>);
      if (ApplicationStore.getUser() === 'admin')
        buttons.push(<div key="overlayEdit" className="modal-control-btn modal-control-btn-left hiddenOnMobile"
                          onClick={this.editImage}><span className="glyphicon glyphicon-edit" aria-hidden="true"></span></div>);
    } else if (this.state.mode === 'edit') {
      buttons.push(<div key="overlayGallery" className="modal-control-btn modal-control-btn-right"
                        onClick={this.showGallery}><span className="glyphicon glyphicon-th" aria-hidden="true"></span></div>);
    }

    const titleContent = this.state.mode === 'image'
      ?(<div key="overlayCenter" className="modal-control-btn-center">
      <span className="imageNavButton imageNavButtonLeft" onClick={this.triggerPrevImage}><span className="glyphicon glyphicon-chevron-left" aria-hidden="true"></span></span>
      <span className="hiddenOnMobile">{this.state.title}</span>
      <span className="imageNavButton imageNavButtonRight" onClick={this.triggerNextImage}><span className="glyphicon glyphicon-chevron-right" aria-hidden="true"></span></span>
    </div>)
      :(<div key="overlayCenter" className="modal-control-btn-center"><span id="overlayTitle">{this.state.title}</span></div>);

    buttons.push(titleContent);

    const content = () => {
      switch (this.state.contentMode) {
        case 'empty':
          return <div key="overlayBodyEmpty" />;
        case 'gallery':
          return <Gallery key="overlayBodyGallery" />;
        case 'galleryImage':
          return <GalleryImage key="overlayBodyGalleryImage" />;
        case 'filelistPresel':
          return <FileList key="overlayBodyFilelist" token={this.props.token} preselected={OverlayStore.getSelectedImageId()}/>;
        case 'filelist':
          return <FileList key="overlayBodyFilelist" token={this.props.token} preselected={OverlayStore.getSelectedImageId() } />;
        case 'login':
          return <Login />;
      }
    };

    const contentClasses = classNames({
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
                {content()}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = Overlay;