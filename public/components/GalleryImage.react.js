var React = require('react/addons');
var Dispatcher = require('./Dispatcher.js');
var MapStore = require('./MapStore.js');

"use strict";

var GalleryImage = React.createClass({
    getInitialState: function () {
        "use strict";
        return {};
    },

    componentDidMount: function () {
      "use strict";
      document.onkeydown = this.onKeyDown;
    },

    componentWillUnmount: function () {
      "use strict";
      document.onkeydown = null;
    },

    onKeyDown: function (e) {
      "use strict";
      switch (e.keyCode) {
        case 37: // left arrow
          Dispatcher.dispatch({
              eventName: 'prev-image'
          });
          break;

        case 39: // right arrow
          Dispatcher.dispatch({
              eventName: 'next-image'
          });
          break;
      }
    },

    render: function() {
        "use strict";
        var path = "/image/" + MapStore.getSelectedImage().id;
        return (
          <div id="galleryImageContainer">
            <img src={path} id="galleryImage" />
          </div>
        );
    }
});

module.exports = GalleryImage;