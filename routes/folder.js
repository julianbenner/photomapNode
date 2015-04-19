var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');

var thisRoot = "images";

function get_folder_content(root, callback) {
  fs.readdir(path.join(thisRoot, root), function (err, files) {
    if (err) {
      callback([]);
    } else {
      var folder = files.map(function (item) {
        if (fs.lstatSync(path.join(thisRoot, root, item)).isDirectory()) {
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

// TODO make sure parents aren't readable