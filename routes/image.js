'use strict';
var express = require('express');
var router = express.Router();

var http = require('http');
var fileSystem = require('fs');
var path = require('path');
var gm = require('gm');
var fs = require('fs');

var Promise = require('promise');
var crypto = require('crypto');
var config = require('../config_server');

const connectionObject = require('../routes/Database').Get();

function promiseGetImage(id) {
  const promise = new Promise(function (resolve, reject) {
    const query =
      'SELECT name, path FROM ' + config.databaseName +
      ' WHERE id=' + connectionObject.escape(id);

    connectionObject.query(query, function (err, rows) {
      if (err) {
        reject(err);
      } else if (!rows[0] || !rows[0].name) {
        reject(new Error('Empty result.'));
      } else {
        resolve(path.join(config.imagePath, rows[0].path || '', rows[0].name));
      }
    });
  });

  return promise;
}

function promiseFileExists(path) {
  return new Promise(function (resolve, reject) {
    fs.stat(path, function(err, stat) {
      if (err === null) { // cached file exists
        resolve(true);
      } else if (err.code == 'ENOENT') { // cached file does not exist
        resolve(false);
      } else { // some other error happened
        reject(err);
      }
    });
  });
}

function deliverFile(id, mode, res, next) {
  promiseGetImage(id).then(function onResolve(result) {
    if (result !== '') {
      if (mode === 'download') {
        res.download(result);
      } else if (mode === 'send') {
        res.sendFile(result, {root: '.'});
      } else {
        throw new Error('Invalid delivery mode.');
      }
    } else {
      throw new Error('Database result was empty.');
    }
  }).catch(function (err) {
    console.log('Error delivering image: ' + err.message);
    sendBlank(res);
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

function promiseImageDimension (file, parameter) {
  return new Promise(function (resolve, reject) {
    getImageDimension(file, parameter, function (err, result) {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

function deliverCachedFile(id, heightComparator, widthComparator, gmHeight, gmWidth, res, next, options) {
  let cachedPath;
  let file;
  let height, width;
  let fileAlreadyDelivered = false;

  promiseGetImage(id).then(function onResolve(result) {
    const filePath = result;
    file = gm(filePath);

    const cacheHash = crypto.createHash('md5').update(filePath + heightComparator + widthComparator + gmHeight + gmWidth).digest("hex");
    cachedPath = path.join(config.cachePath, cacheHash.toString());

    // promise determines whether the cached file already exists
    return promiseFileExists(cachedPath);
  }).then(function onResolve(result) {
    if (result) { // file exists
      fileAlreadyDelivered = true;
      imageOriginal(cachedPath, res, next);
    } else { // file needs to be generated
      return promiseImageDimension(file, 'height');
    }
  }).then(function onResolve(result) {
    if (!fileAlreadyDelivered) {
      height = result;
      return promiseImageDimension(file, 'width');
    }
  }).then(function onResolve(result) {
    if (!fileAlreadyDelivered) {
      width = result;

      const heightComparisonHolds = heightComparator !== null && height > heightComparator;
      const widthComparisonHolds = widthComparator !== null && width > widthComparator;
      let deliverFile = (heightComparisonHolds || widthComparisonHolds)
        ? file.resize(gmWidth, gmHeight)
        : file;

      if (typeof options !== 'undefined') {
        if (typeof options.crop !== 'undefined') {
          deliverFile = deliverFile.gravity('Center').crop(options.crop.x, options.crop.y);
        }

        if (typeof options.quality !== 'undefined') {
          deliverFile = deliverFile.quality(options.quality);
        }
      }

      deliverFile.write(cachedPath, function () {
        res.set('Content-Type', 'image/jpeg');
        fs.createReadStream(cachedPath).pipe(res);
      });
    }
  }).catch(function (err) {
    console.log('Error delivering image: ' + err.message);
    sendBlank(res);
  });
}

  function getImageDimension(image, dimension, callback) {
  image.size(function (err, value) {
    if (err) {
      callback(err);
    } else if (value && value[dimension]) {
      callback(err, value[dimension]);
    } else {
      callback(new Error('Could not retreive image dimensions.'));
    }
  });
}

function sendBlank(res) {
  var readStream = fileSystem.createReadStream('blank.png');
  readStream.pipe(res);
}

router.get('/:id/thumb', function (req, res, next) {
  const edge = 270;

  deliverCachedFile(req.params.id, edge, edge, edge, edge + '^', res, next, {crop:{x:270, y:180}});
});

// tiny: 40 width/height
router.get('/:id/tinySquare', function (req, res, next) {
  const longestEdge = 40;

  deliverCachedFile(req.params.id, longestEdge, longestEdge, longestEdge, longestEdge + '^', res, next, {crop:{x: 40, y: 40}});
});

// tiny: 40 width/height
router.get('/:id/tiny', function (req, res, next) {
  const longestEdge = 40;

  deliverCachedFile(req.params.id, longestEdge, longestEdge, null, longestEdge + '>', res, next);
});

// small: 600 longest edge
router.get('/:id/small', function (req, res, next) {
  const longestEdge = 600;

  deliverCachedFile(req.params.id, longestEdge, longestEdge, null, longestEdge + '>', res, next);
});

// medium: 1000 height
router.get('/:id/medium', function (req, res, next) {
  const height = 1000;

  deliverCachedFile(req.params.id, height, null, height, null, res, next);
});

// huge: 2000 height
router.get('/:id/huge', function (req, res, next) {
  const height = 2000;

  deliverCachedFile(req.params.id, height, null, height, null, res, next);
});

router.get('/:id/down', function (req, res, next) {
  deliverFile(req.params.id, 'download', res, next);
});

router.get('/:id', function (req, res, next) {
  deliverFile(req.params.id, 'send', res, next);
});

module.exports = router;