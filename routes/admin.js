'use strict';
var express = require('express');
var path = require('path');
var passport = require('passport');
var fs = require('fs');
var auth = require('./logic/auth');
var helpers = require('./logic/helpers');
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

  var query = 'SELECT * FROM ' + config.imageTableName + ' ORDER BY path,name' + (use_limit ? ' LIMIT ' + start_from + ', ' + amount : '');
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
  if (typeof request.query === 'undefined') {
    return false;
  } else if (typeof request.query.token !== 'undefined') {
    if (auth.tokenToUser(request.query.token) === 'admin') return true;
  } else if (typeof request.get('token') !== 'undefined') {
    if (auth.tokenToUser(request.get('token')) === 'admin') return true;
  }
  return false;
}

function getPasswordHashPromise(user) {
  return new Promise(function (resolve, reject) {
    var connection = require('../routes/Database').Get();

    const query = 'SELECT password FROM `' + config.userTableName + '` WHERE `name` = ' + connection.escape(user);
    connection.query(query, function(err, result) {
      if (err) {
        reject(err);
      } else {
        if (typeof result[0] === 'undefined') {
          reject('User not found!');
        } else if (typeof result[0]['password'] === 'undefined') {
          reject('Could not verify password!');
        } else {
          resolve(result[0]['password']);
        }
      }
    });
  });
}

function checkIfPasswordValidPromise(user, password) {
  return new Promise(function (resolve, reject) {
    getPasswordHashPromise(user).then(function onResolve(hash) {
      helpers.verifyPasswordHashPromise(password, hash).then(function onResolve(pwIsValid) {
        if (pwIsValid === true) {
          resolve(true);
        } else {
          resolve(false);
        }
      }).catch(function (err) {
        reject(err);
      });
    }).catch(function (err) {
      reject(err);
    });
  });
}

function changePasswordPromise(user, oldPw, newPw) {
  return new Promise(function (resolve, reject) {
    checkIfPasswordValidPromise(user, oldPw).then(function onResolve(oldPwIsValid) {
      if (oldPwIsValid === true) {
        helpers.generatePasswordHashPromise(newPw).then(function onResolve(newPwHash) {
          var connection = require('../routes/Database').Get();

          const query = 'UPDATE `' + config.userTableName + '` SET `password`=' + connection.escape(newPwHash) + ' WHERE `name` = ' + connection.escape(user);
          connection.query(query, function(err, result) {
            if (err) {
              reject('Could not update user');
            } else {
              resolve();
            }
          });
        });
      } else {
        reject('Wrong password!');
      }
    }).catch(function (err) {
      reject(err);
    });
  });
}

function checkIfFileInDb(folder, file, callback) {
  var connection = require('../routes/Database').Get();

  const query = 'SELECT EXISTS(SELECT * FROM `' + config.imageTableName + '` WHERE `path` = ' + connection.escape(folder) + ' AND `name` = ' + connection.escape(file) + ') as `exists`';
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
        getImageMetadataPromise(config.tempPath, tempFile.name).then(function onResolve(result) {
          const source = fs.createReadStream(tempFile.path);
          const dest = fs.createWriteStream(path.join(config.imagePath, destination, tempFile.originalname));
          source.pipe(dest);

          source.on('error', function(err) { fs.unlink(tempFile.path); reject(err); });
          source.on('end', function() {
            fs.unlink(tempFile.path);
          });

          addImageToDb(destination, tempFile.originalname, result.lat, result.lon, result.date, result.direction);
          resolve();
        }).catch(function(err) {
          reject(err.message);
        });
      }
    }).catch(function(err) {
      reject(err.message);
    });
  });
}

function addImageToDb(folder, image, lat, lon, date, direction) {
  var connection = require('../routes/Database').Get();

  if (image !== 'Thumbs.db') { // herp
    let columns, content;
    columns = 'name, path';
    content = '';
    if (typeof lat !== 'undefined' && typeof lon !== 'undefined') {
      columns += ', lat, lon';
      content += ', ' + connection.escape(lat) + ',' + connection.escape(lon);
    }
    if (typeof date !== 'undefined') {
      columns += ', date';
      content += ', ' + connection.escape(date);
    }
    if (typeof direction !== 'undefined') {
      columns += ', direction';
      content += ', ' + connection.escape(direction);
    }
    const query = 'INSERT INTO `' + config.imageTableName + '` (' + columns + ') VALUES (' + connection.escape(image) + ',' + connection.escape(folder) + content + ')';
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

function deleteFilePromise(id) {
  return new Promise(function(resolve, reject) {
    const connection = require('../routes/Database').Get();
    const query = 'SELECT path, name FROM `' + config.imageTableName + '` WHERE id = ' + connection.escape(id);
    console.log(query);
    connection.query(query, function (err, result) {
      if (err) {
        reject(err);
      }
      if (result[0].path !== 'undefined' &&
        result[0].name !== 'undefined') {
        const fullPath = path.join(config.imagePath, result[0].path, result[0].name);
        fs.unlink(fullPath, function () {
          console.log('Deleted file ' + fullPath);
          resolve();
        });
      } else {
        reject('Invalid database answer!');
      }
    });
  });
}

function deleteDbRowPromise(id) {
  return new Promise(function(resolve, reject) {
    const connection = require('../routes/Database').Get();
    const query = 'DELETE FROM `' + config.imageTableName + '` WHERE id = ' + connection.escape(id);
    console.log(query);
    connection.query(query, function (err, result) {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
}

function deleteImage(id, callback) {
  const filePromise = deleteFilePromise(id);
  const databasePromise = deleteDbRowPromise(id);

  filePromise.then(function onResolve() {
    databasePromise.then(function onResolve() {
      callback(null, '');
    }).catch(function (err) {
      callback(err);
    });
  }).catch(function (err) {
    callback(err);
  });
}

function getImageMetadataPromise(folder, image) {
  return new Promise(function(resolve, reject) {
    new ExifImage({ image : path.join(folder, image) }, function (err, exifData) {
      if (err)
        reject(err);
      else {
        const gps = exifData.gps;
        const exif = exifData.exif;
        let lat, lon, date, direction;
        if (typeof gps.GPSLongitude !== 'undefined' && typeof gps.GPSLatitude !== 'undefined') {
          lat = gps.GPSLatitude[0] + gps.GPSLatitude[1] / 60 + gps.GPSLatitude[2] / (60 * 60);
          lat = lat * (gps.GPSLatitudeRef === 'N' ? 1 : -1);
          lon = gps.GPSLongitude[0] + gps.GPSLongitude[1] / 60 + gps.GPSLongitude[2] / (60 * 60);
          lon = lon * (gps.GPSLongitudeRef === 'E' ? 1 : -1);
        }
        if (typeof gps.GPSImgDirection !== 'undefined') {
          direction = gps.GPSImgDirection;
        }
        if (typeof exif !== 'undefined' && typeof exif.DateTimeOriginal !== 'original') {
          date = exif.DateTimeOriginal;
        }
        resolve({
          lat: lat,
          lon: lon,
          date: date,
          direction: direction
        });
      }
    });
  });
}

function compareFileToDb(folder, item) {
  getImageMetadataPromise(config.imagePath + '/' + folder, item).then(function onResolve(result) {
    checkIfFileInDb(folder, item, function (answer) {
      if (typeof answer.exists !== 'undefined' && answer.exists == false) {
        console.log('Image ' + folder + '/' + item + ' does not exist in database!');
        addImageToDb(folder, item, result.lat, result.lon, result.date, result.direction);
      } else {
        console.log('Image ' + folder + '/' + item + ' exists in database!');
      }
    });
  }).catch(function(err) {
    console.log(err);
  });
}

function compareFsToDb(folder, callback) {
  fs.readdir(config.imagePath + '/' + folder, function (err, files) {
    if (err) {

    } else {
      files.forEach(function (item) {
        if (fs.lstatSync(path.join(config.imagePath, folder, item)).isDirectory()) {
          const path = folder === '' ? item : folder + '/' + item;
          compareFsToDb(path); // path join yields backslashes with windows
        } else {
          compareFileToDb(folder, item);
        }
      });
    }
  });
}

function compareDbToFs() {
  getListOfImages('all', 1, function (images) {
    images.forEach(function (image) {
      checkIfFileInFsPromise(config.imagePath + '/' + image.path, image.name).then(function onResolve(result) {
        if (result !== false) { // file exists on file system
          console.log('Image ' + image.id + ' exists in file system!');
        } else { // file doesn't exist
          console.log('Image ' + image.id + ' does not exist in file system!');
          deleteDbRowPromise(image.id).then(function onResolve() {
            console.log('Deleted image ' + image.id + '!');
          });
        }
      })
    });
  });
}

function fullScan(callback) {
  compareFsToDb('');
  compareDbToFs();
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
      if (!Array.isArray(req.files.fileInput))
        req.files.fileInput = [req.files.fileInput];
      const folderHeader = req.get('folder');
      const destination = typeof folderHeader === 'undefined' ? '' : folderHeader === '/' ? '' : folderHeader;
      const uploadImagePromiseArray = req.files.fileInput.map(function (file) {
        return uploadImagePromise(file, destination);
      });
      Promise.all(uploadImagePromiseArray).then(function onResolve(results) {
        console.log(results);
        res.sendStatus(200);
      }).catch (function(err) {
        res.status(400).send(err);
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
    if (userIsAdmin(req)) {
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

  router.post('/change_password', function(req, res) {
    const user = req.body.user || '';
    const oldPw = req.body.oldPw || '';
    const newPw = req.body.newPw || '';
    changePasswordPromise(user, oldPw, newPw).then(function onResolve() {
      res.sendStatus(200);
    }).catch(function (err) {
      console.log(err.stack);
      res.status(400).send(err);
    });
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