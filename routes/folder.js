var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var config = require('../config_server');

function get_folder_content(root, callback) {
  root = root.replace(/\./g, '');
  fs.readdir(path.join(config.imagePath, root), function (err, files) {
    if (err) {
      callback([]);
    } else {
      var folder = files.map(function (item) {
        if (fs.lstatSync(path.join(config.imagePath, root, item)).isDirectory()) {
          return ({name: item, type: "folder"});
        } else {
         // return /*({name: item, type: "file"})*/;
        }
      });
      callback(folder);
    }
  });
}

router.get('/', function (req, res, next) {
  console.log(req.query.root);
  get_folder_content(req.query.root, function (data) {
    res.json(data);
  });
});

module.exports = router;