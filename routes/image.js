'use strict';
var express = require('express');
var router = express.Router();

var http = require('http');
var fileSystem = require('fs');
var path = require('path');
var gm = require('gm');
var fs = require('fs');

var Promise = require('promise');
var murmur = require('murmurhash-js');

// path relative to node root where the images are stored
const imageFolder = 'images';
// path relative to node root where the cache is stored
const cacheFolder = 'cache';

function get_image(id, callback) {
  var connection = require('../routes/Database').Get();
  var query =
    'SELECT name, path FROM ' +
    'photomap_image WHERE id=' + connection.escape(id);

    connection.query(query,
      function (err, rows, fields) {
        try {
          if (err || !rows[0]) throw err;
          callback(path.join(imageFolder, rows[0].path || '', rows[0].name));
        } catch(e) {
          callback('');
        }
      }
    );
}

router.get('/:id/thumb', function (req, res, next) {
  try {
    get_image(req.params.id, function (data) {
      if (data === '') {
        var readStream = fileSystem.createReadStream('blank.png');
        readStream.pipe(res);
      }
      var filePath = data;
      if (!gm)
        console.err("Could not run GraphicksMagic");
      gm(filePath).resize(200)
        .stream(function (err, stdout, stderr) {
          if (err) return next(err);
          res.set('Content-Type', 'image/jpeg');
          stdout.pipe(res);

          stdout.on('error', next);
        });
    });
  } catch(e) {
    sendBlank(res);
  }
});

// tiny: 40 width/height
router.get('/:id/tiny', function (req, res, next) {
  get_image(req.params.id, function (data) {
    var filePath = data;
    gm(filePath).resize('40^', '40^')
      .stream(function (err, stdout, stderr) {
        if (err) return next(err);
        res.set('Content-Type', 'image/jpeg');
        stdout.pipe(res);

        stdout.on('error', next);
      });
  });
});

// small: 600 longest edge
router.get('/:id/small', function (req, res, next) {
  get_image(req.params.id, function (data) {
    const filePath = data;
    const file = gm(filePath);

    const longestEdge = 600;

    const cacheHash = murmur(filePath + longestEdge + 'longest');
    const cachedPath = path.join(cacheFolder, cacheHash.toString());

    fs.stat(cachedPath, function(err, stat) {
      if(err == null) {
        // cache file already exists
        imageOriginal(cachedPath, res, next);
      } else if(err.code == 'ENOENT') {
        var promiseHeight = new Promise(function (resolve, reject) {
          getImageDimension(file, 'height', function (result) {
            resolve(result);
          })
        });

        var promiseWidth = new Promise(function (resolve, reject) {
          getImageDimension(file, 'width', function (result) {
            resolve(result);
          })
        });

        Promise.all([promiseHeight, promiseWidth]).then(function (result) {
          if (result[0] > longestEdge && result[1] > longestEdge) {
            file.resize(longestEdge + '>', null).write(cachedPath, function () {
              res.set('Content-Type', 'image/jpeg');
              fs.createReadStream(cachedPath).pipe(res);
            });
          } else {
            file.write(cachedPath, function () {
              res.set('Content-Type', 'image/jpeg');
              fs.createReadStream(cachedPath).pipe(res);
            });
          }
        });
      } else {
        console.log('Error checking for file existence: ', err.code);
        sendBlank(res);
      }
    });
  });
});

// medium: 1000 height
router.get('/:id/medium', function (req, res, next) {
  get_image(req.params.id, function (data) {
    var filePath = data;
    var file = gm(filePath);

    const height = 1000;

    var promiseHeight = new Promise(function (resolve, reject) {
      getImageDimension(file, 'height', function (result) {
        resolve(result);
      })
    });

    Promise.all([promiseHeight]).then(function (result) {
      if (result[0] > height) {
        imageResize(file, null, height, res, next);
      } else {
        imageOriginal(filePath, res, next);
      }
    });
  });
});

function getImageDimension(image, dimension, callback) {
  image.size(function (err, value) {
    if (value[dimension]) {
      callback(value[dimension]);
    } else {
      callback(0);
    }
  });
}

// huge: 2000 height
router.get('/:id/huge', function (req, res, next) {
  get_image(req.params.id, function (data) {
    var filePath = data;
    var file = gm(filePath);

    const height = 2000;

    var promiseHeight = new Promise(function (resolve, reject) {
      getImageDimension(file, 'height', function (result) {
        resolve(result);
      })
    });

    Promise.all([promiseHeight]).then(function (result) {
      if (result[0] > height) {
        imageResize(file, null, height, res, next);
      } else {
        imageOriginal(filePath, res, next);
      }
    });
  });
});

router.get('/:id/down', function (req, res, next) {
  get_image(req.params.id, function (data) {
    res.download(data);
  });
});

function sendBlank(res) {
  var readStream = fileSystem.createReadStream('blank.png');
  readStream.pipe(res);
}

router.get('/:id', function (req, res, next) {
  get_image(req.params.id, function (data) {
    if (data !== '') {
      imageOriginal(data, res, next);
    } else {
      sendBlank(res);
    }
  });
});

function imageResize(file, width, height, res, next) {
  file.resize(width, height)
    .stream(function (err, stdout, stderr) {
      if (err) return next(err);
      res.set('Content-Type', 'image/jpeg');
      stdout.pipe(res);

      stdout.on('error', next);
    });
}

function imageOriginal(filePath, res, next) {
  var stat = fileSystem.statSync(filePath);

  res.writeHead(200, {
    'Content-Type': 'image/jpeg',
    'Content-Length': stat.size
  });

  var readStream = fileSystem.createReadStream(filePath);
  readStream.pipe(res);
}

module.exports = router;