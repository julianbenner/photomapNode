'use strict';
var express = require('express');
var path = require('path');
var passport = require('passport');
var fs = require('fs');
var auth = require('./logic/auth');
var gm = require('gm');
var ExifImage = require('exif').ExifImage;

var databaseName = 'photomap_image';
var imagePath = 'images';

function getListOfImages(amount, page, callback) {
  var connection = require('../routes/Database').Get();

  var use_limit = amount !== 'all';

  page = parseInt(page);
  page = isNaN(page) ? 1 : page;
  amount = parseInt(amount);
  amount = isNaN(amount) ? 10 : amount;

  var start_from = connection.escape(amount * (page - 1));
  amount = connection.escape(amount);

  var query = 'SELECT * FROM ' + databaseName + ' ORDER BY path,name' + (use_limit ? ' LIMIT ' + start_from + ', ' + amount : '');
  console.log(query);
  connection.query(
    query,
    function(err, rows, fields) {
      if (err) throw err;
      callback(rows);
    });
}

function edit_image(id, name, lat, lon, date, callback) {
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
  if (typeof request.query === 'undefined') {
    return false;
  } else if (typeof request.query.token === 'undefined') {
    return false;
  } else if (auth.tokenToUser(request.query.token) === 'admin') {
    return true;
  }
  return false; // TODO
}

function checkIfFileInDb(folder, file, callback) {
  var connection = require('../routes/Database').Get();

  const query = 'SELECT EXISTS(SELECT * FROM `' + databaseName + '` WHERE `path` = ' + connection.escape(folder) + ' AND `name` = ' + connection.escape(file) + ') as `exists`';
  console.log(query);
  connection.query(query, function(err, result) {
    if (err) {
      return {success: false};
    } else {
      const answer = {success: true, file: folder + '/' + file, exists: result[0]['exists']};
      if (!answer.exists) {
        callback();
      }
      return answer;
    }
  });
}

function addImage(folder, image, lat, lon) {
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
    const query = 'INSERT INTO `' + databaseName + '` (' + columns + ') VALUES (' + connection.escape(image) + ',' + connection.escape(folder) + content + ')';
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

  const query = 'DELETE FROM `' + databaseName + '` WHERE id = ' + connection.escape(id);
  console.log(query);
  connection.query(query, function (err, result) {
    if (err) {
      console.log(err);
    }
    callback(err, result);
  });
}

function compare_fs_to_db(folder, callback) {
  fs.readdir(imagePath + '/' + folder, function (err, files) {
    if (err) {

    } else {
      files.forEach(function (item) {
        if (fs.lstatSync(path.join(imagePath, folder, item)).isDirectory()) {
          if (folder === '')
            compare_fs_to_db(item);
          else
            compare_fs_to_db(folder + '/' + item); // path join yields backslashes with windows
        } else {
          let lat, lon;
          try {
            new ExifImage({ image : path.join(imagePath, folder, item) }, function (error, exifData) {
              if (error)
                console.log('Error: '+error.message);
              else {
                const gps = exifData.gps;
                if (typeof gps.GPSLongitude !== 'undefined' && typeof gps.GPSLatitude !== 'undefined') {
                  lat = gps.GPSLatitude[0] + gps.GPSLatitude[1] / 60 + gps.GPSLatitude[2] / (60 * 60);
                  lat = lat * (gps.GPSLatitudeRef === 'N' ? 1 : -1);
                  lon = gps.GPSLongitude[0] + gps.GPSLongitude[1] / 60 + gps.GPSLongitude[2] / (60 * 60);
                  lon = lon * (gps.GPSLongitudeRef === 'E' ? 1 : -1);
                }
                console.log(exifData); // Do something with your data!
              }
            });
          } catch (error) {
            console.log('Error: ' + error.message);
          }
          checkIfFileInDb(folder, item, function () {
            addImage(folder, item, lat, lon);
          });
        }
      });
    }
  });
}

function full_scan(callback) {
  compare_fs_to_db('');
  callback();
}

module.exports = function admin() {
  var router = express.Router();

  var relPath = '/admin';

  router.post('/edit', function(req, res) {
    if (userIsAdmin(req)) {
      edit_image(req.body.id, req.body.name, req.body.lat, req.body.lon, req.body.date, function() {
        res.send('');
      });
    } else {
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
      full_scan(function (data) {
        res.json(data);
      })
    } else {
      res.sendStatus(401);
    }
  });

  return router;
};