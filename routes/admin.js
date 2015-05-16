'use strict';
var express = require('express');
var path = require('path');
var passport = require('passport');
var fs = require('fs');
var auth = require('./logic/auth');
var multer = require('multer');
var ExifImage = require('exif').ExifImage;
var config = require('../config_server');

function getListOfImages(amount, page, callback) {
  var connection = require('../routes/Database').Get();

  var use_limit = amount !== 'all';

  page = parseInt(page);
  page = isNaN(page) ? 1 : page;
  amount = parseInt(amount);
  amount = isNaN(amount) ? 10 : amount;

  var start_from = connection.escape(amount * (page - 1));
  amount = connection.escape(amount);

  var query = 'SELECT * FROM ' + config.databaseName + ' ORDER BY path,name' + (use_limit ? ' LIMIT ' + start_from + ', ' + amount : '');
  console.log(query);
  connection.query(
    query,
    function(err, rows, fields) {
      if (err) throw err;
      callback(rows);
    });
}

function editImage(id, name, lat, lon, date, callback) {
  var connection = require('../routes/Database').Get();

  var image = {id: id, name: name, lat: lat, lon: lon, date: date};

  if (id > 0) {
    var query = connection.query('UPDATE photomap_image SET ? WHERE id = ' + connection.escape(image.id), image, function(err, result) {
      callback();
    }); 
    console.log(query.sql);
    return;
  }
  callback();
}

function userIsAdmin(request) {
  // TODO
  if (typeof request.query === 'undefined') {
    return false;
  } else if (typeof request.query.token !== 'undefined') {
    if (auth.tokenToUser(request.query.token) === 'admin') return true;
  } else if (typeof request.get('token') !== 'undefined') {
    if (auth.tokenToUser(request.get('token')) === 'admin') return true;
  }
  return false;
}

function checkIfFileInDb(folder, file, callback) {
  var connection = require('../routes/Database').Get();

  const query = 'SELECT EXISTS(SELECT * FROM `' + config.databaseName + '` WHERE `path` = ' + connection.escape(folder) + ' AND `name` = ' + connection.escape(file) + ') as `exists`';
  console.log(query);
  connection.query(query, function(err, result) {
    if (err) {
      callback({success: false});
    } else {
      const answer = {success: true, file: folder + '/' + file, exists: result[0]['exists']};
      callback(answer);
    }
  });
}

function checkIfFileInDbPromise(folder, file) {
  return new Promise(function (resolve, reject) {
    checkIfFileInDb(folder, file, function(result) {
      if (result.success) {
        if (result.exists == 0) {
          resolve(false);
        } else {
          resolve(true);
        }
      } else {
        reject('Database query failed!');
      }
    })
  });
}

function checkIfFileInFsPromise(folder, file) {
  return new Promise(function (resolve, reject) {
    fs.stat(path.join(folder, file), function(err, stat) {
      if(err == null) {
        resolve(true);
      } else if(err.code == 'ENOENT') {
        resolve(false);
      } else {
        reject(err);
      }
    })
  });
}

function uploadImagePromise(tempFile, destination) {
  return new Promise(function (resolve, reject) {
    const fileInDbPromise = checkIfFileInDbPromise(destination, tempFile.originalname);
    const fileInFsPromise = checkIfFileInFsPromise(destination, tempFile.originalname);

    Promise.all([fileInDbPromise, fileInFsPromise]).then(function onResolve(res) {
      if (res[0] == true)
        reject('File already exists in database!');
      else if (res[1] == true)
        reject('File already exists in file system!');
      else {
        const source = fs.createReadStream(tempFile.path);
        const dest = fs.createWriteStream(path.join(config.imagePath, destination, tempFile.originalname));
        source.pipe(dest);
        source.on('error', function(err) { fs.unlink(tempFile.path); reject(err); });

        source.on('end', function() {
          fs.unlink(tempFile.path);
          getImageMetadataPromise(destination, tempFile.originalname).then(function onResolve(result) {
              addImageToDb(destination, tempFile.originalname, result.lat, result.lon);
              resolve();
          });
        });
      }
    }).catch(function(err) {
      reject(err);
    });
  });
}

function addImageToDb(folder, image, lat, lon) {
  var connection = require('../routes/Database').Get();

  if (image !== 'Thumbs.db') { // TODO
    let columns, content;
    if (typeof lat !== 'undefined' && typeof lon !== 'undefined') {
      columns = 'name, path, lat, lon';
      content = ', ' + connection.escape(lat) + ',' + connection.escape(lon);
    } else {
      columns = 'name, path';
      content = '';
    }
    const query = 'INSERT INTO `' + config.databaseName + '` (' + columns + ') VALUES (' + connection.escape(image) + ',' + connection.escape(folder) + content + ')';
    console.log(query);
    connection.query(query, function (err, result) {
      if (err) {
        console.err(err);
      } else {
        //console.log(result);
      }
    });
  }
}

function deleteImage(id, callback) {
  var connection = require('../routes/Database').Get();

  const query = 'DELETE FROM `' + config.databaseName + '` WHERE id = ' + connection.escape(id);
  console.log(query);
  connection.query(query, function (err, result) {
    if (err) {
      console.log(err);
    }
    callback(err, result);
  });
}

function getImageMetadataPromise(folder, image) {
  return new Promise(function(resolve, reject) {
    new ExifImage({ image : path.join(config.imagePath, folder, image) }, function (err, exifData) {
      if (err)
        reject(err);
      else {
        const gps = exifData.gps;
        let lat, lon;
        if (typeof gps.GPSLongitude !== 'undefined' && typeof gps.GPSLatitude !== 'undefined') {
          lat = gps.GPSLatitude[0] + gps.GPSLatitude[1] / 60 + gps.GPSLatitude[2] / (60 * 60);
          lat = lat * (gps.GPSLatitudeRef === 'N' ? 1 : -1);
          lon = gps.GPSLongitude[0] + gps.GPSLongitude[1] / 60 + gps.GPSLongitude[2] / (60 * 60);
          lon = lon * (gps.GPSLongitudeRef === 'E' ? 1 : -1);
        }
        resolve({
          lat: lat,
          lon: lon
        });
      }
    });
  });
}

function compareFsToDb(folder, callback) {
  fs.readdir(config.imagePath + '/' + folder, function (err, files) {
    if (err) {

    } else {
      files.forEach(function (item) {
        if (fs.lstatSync(path.join(config.imagePath, folder, item)).isDirectory()) {
          if (folder === '')
            compareFsToDb(item);
          else
            compareFsToDb(folder + '/' + item); // path join yields backslashes with windows
        } else {
          getImageMetadataPromise(folder, item).then(function onResolve(result) {
            checkIfFileInDb(folder, item, function () {
              addImageToDb(folder, item, result.lat, result.lon);
            });
          }).catch(function(err) {
            console.log(err);
          });
        }
      });
    }
  });
}

// todo
function fullScan(callback) {
  compareFsToDb('');
  callback();
}

module.exports = function admin() {
  var router = express.Router();

  var relPath = '/admin';

  router.post('/edit', function(req, res) {
    if (userIsAdmin(req)) {
      editImage(req.body.id, req.body.name, req.body.lat, req.body.lon, req.body.date, function() {
        res.send('');
      });
    } else {
      res.sendStatus(401);
    }
  });

  router.post('/upload', function(req, res) {
    console.dir(req.files);
    if (userIsAdmin(req)) {
      const uploadImagePromiseArray = req.files.fileInput.map(function (file) {
        return uploadImagePromise(file, '');
      });
      Promise.all(uploadImagePromiseArray).then(function (results) {
        console.log(results);
        res.sendStatus(200);
      });
    } else {
      req.files.map(function (file) {
        fs.unlink(file.path, function () {
          console.log('Deleted unauthorized temporary file ' + file.name);
        });
      });
      res.sendStatus(401);
    }
  });

  router.delete('/delete', function(req, res) {
    if (user_is_admin(req)) {
      deleteImage(req.body.id, function(err, result) {
        if (err) {
          res.sendStatus(400);
        } else {
          res.sendStatus(200);
        }
      });
    } else {
      res.sendStatus(401);
    }
  });

  router.post('/login',
    passport.authenticate('local', {
      failureRedirect: 'login',
      failureFlash: true
    }),

    function(req, res) {
      res.redirect(path.join(relPath, '/'));
    });

  router.get('/', function(req, res) {
    res.render('admin', {
      user: req.user
    });
  });

  router.get('/login', function(req, res) {
    if (req.user) {
      res.redirect(path.join(relPath, '/'));
    } else {
      res.render('login', {
        message: req.flash('error'),
        user: req.user
      });
    }
  });

  router.get('/logout', function(req, res) {
    req.logout();
    res.redirect(path.join(relPath, '/'));
  });

  router.get('/list', function(req, res) {
    if (userIsAdmin(req)) {
      getListOfImages(req.query.amount, req.query.page, function(result) {
        res.json(result);
      });
    } else {
      res.sendStatus(401);
    }
  });

  router.get('/fullscan', function(req, res) {
    if (userIsAdmin(req)) {
      fullScan(function (data) {
        res.json(data);
      })
    } else {
      res.sendStatus(401);
    }
  });

  return router;
};