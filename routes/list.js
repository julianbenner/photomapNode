'use strict';
var express = require('express');
var router = express.Router();

var helpers = require('./logic/helpers');

function get_image_list(lat_min, lat_max, lon_min, lon_max, dateMin, dateMax, folderFilter, folderFilteringEnabled, callback) {
  var connection = require('../routes/Database').Get();

  var constraints = 'lat BETWEEN ' + connection.escape(lat_min) + ' AND ' + connection.escape(lat_max) +
    ' AND lon BETWEEN ' + connection.escape(lon_min) + ' AND ' + connection.escape(lon_max);

  if (typeof dateMin !== 'undefined' && dateMin !== '')
    constraints += ' AND date > ' + connection.escape(dateMin);
  if (typeof dateMax !== 'undefined' && dateMax !== '')
    constraints += ' AND date < ' + connection.escape(dateMax);
  if (folderFilteringEnabled === true || folderFilteringEnabled === 'true') {
    constraints += ' AND (1=0' + helpers.folderFilterToConstraint(folderFilter) + ')';
  }

  var query = 'SELECT id, name FROM ' +
    'photomap_image WHERE ' + constraints;
  connection.query(
    query, function (err, rows, fields) {
      if (err) throw err;
      callback(rows);
    });
}

router.get('/', function (req, res, next) {
  const latMin = req.query.latMin || 0;
  const latMax = req.query.latMax || 0;
  const lonMin = req.query.lonMin || 0;
  const lonMax = req.query.lonMax || 0;
  const dateMin = req.query.dateMin || undefined;
  const dateMax = req.query.dateMax || undefined;
  const folderFilter = JSON.parse(req.query.folderFilter) || {};
  const folderFilteringEnabled = req.query.folderFilteringEnabled || false;
  get_image_list(latMin, latMax, lonMin, lonMax, dateMin, dateMax, folderFilter, folderFilteringEnabled, function (data) {
    res.json(data);
  });
});

module.exports = router;
