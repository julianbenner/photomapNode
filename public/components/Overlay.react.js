var React = require('react/addons');
var Dispatcher = require('./Dispatcher.js');
var MapStore = require('./MapStore.js');
var Gallery = require('./Gallery.react');
var GalleryImage = require('./GalleryImage.react');
var FileList = require('./FileList.react');
require('bootstrap');

"use strict";

var Overlay = React.createClass({
  getInitialState: function () {
    "use strict";
    return {
      content: (<div />),
      mode: ""
    };
  },

  componentDidMount: function () {
    "use strict";
    MapStore.on('update-overlay', this.updateOverlay);
    MapStore.on('show-overlay', this.showOverlay);
  },

  componentWillUnmount: function () {
    "use strict";
    MapStore.removeListener('update-overlay', this.updateOverlay);
    MapStore.removeListener('show-overlay', this.showOverlay);
  },

  showOverlay: function () {
    "use strict";    
    $(this.getDOMNode()).modal('show');
  },

  hideOverlay: function () {
    "use strict";    
    $(this.getDOMNode()).modal('hide');
  },

  showGallery: function () {
    "use strict";    
    Dispatcher.dispatch({
        eventName: 'show-gallery'
    });
  },

  editImage: function () {
    "use strict";
    Dispatcher.dispatch({
        eventName: 'edit-image'
    });
  },

  updateOverlay: function () {
    "use strict";

    var mode = MapStore.getOverlayMode();
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
          content: (<FileList preselected={MapStore.getSelectedImageId()} />)
        });
        break;
    }
  },

  render: function() {
    "use strict";

    var buttons = []
    buttons.push(<div className="modal-control-btn modal-control-btn-right" onClick={this.hideOverlay}>Close</div>);

    if (this.state.mode === 'image') {
      buttons.push(<div className="modal-control-btn modal-control-btn-right" onClick={this.showGallery}>Gallery</div>);
      buttons.push(<div className="modal-control-btn modal-control-btn-left" onClick={this.editImage}>Edit</div>);
    } else if (this.state.mode === 'edit') {
      buttons.push(<div className="modal-control-btn modal-control-btn-right" onClick={this.showGallery}>Gallery</div>);
    }

    return (
      <div className="modal fade">
        <div className="modal-control">
          {buttons}
        </div>
        <div className="modal-dialog large_modal">
        <div className="modal-intermediate">
          <div className="modal-content">
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