var express = require('express');


function get_image_count(lat_min, lat_max, lon_min, lon_max, callback) {
  var query = 'SELECT image_count, slat/image_count as avg_lat, slon/image_count as avg_lon FROM ' +
    '(SELECT COUNT(*) as image_count, SUM(lat) as slat, SUM(lon) as slon FROM ' +
    'photomap_image WHERE lat BETWEEN ' + connection.escape(lat_min) + ' AND ' + connection.escape(lat_max) + ' AND lon BETWEEN ' + connection.escape(lon_min) + ' AND ' + connection.escape(lon_max) + ') t';
  connection.query(
    query,
    function(err, rows, fields) {
      if (err) throw err;
      callback(rows[0]);
    });
}
module.exports = function admin() {
  var router = express.Router();

var passport = require('passport');

  router.post('/login', passport.authenticate('local', {
    successRedirect: '/admin',
    failureRedirect: '/admin/login',
    failureFlash: true
  }));

  router.get('/', function(req, res) {
    res.render('admin');
  });

  router.get('/login', function(req, res) {
    res.render('login');
  });

  return router;
};