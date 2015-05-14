'use strict';
var express = require('express');
var router = express.Router();

var helpers = require('./logic/helpers');

var NodeCache = require('node-cache');
var cacheInstance = new NodeCache();

var is_production = function () {
  try {
    return express().get('env') === 'production';
  } catch (e) {
    return false;
  }
};

function get_image_count(lat_min, lat_max, lon_min, lon_max, dateMin, dateMax, folderFilter, folderFilteringEnabled, callback) {
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

  var query = 'SELECT image_count, slat/image_count as avg_lat, slon/image_count as avg_lon FROM ' +
    '(SELECT COUNT(*) as image_count, SUM(lat) as slat, SUM(lon) as slon FROM ' +
    'photomap_image WHERE ' + constraints + ') t';

  //if (!is_production())
    console.log(query);

  connection.query(query, function (err, rows, fields) {
    if (err) {
      if (is_production())
        callback({"SUCCESS": false});
      else
        callback({"SUCCESS": false, "ERROR": err.code});
    } else {
      rows[0].SUCCESS = true;
      callback(rows[0]);
    }
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
  get_image_count(latMin, latMax, lonMin, lonMax, dateMin, dateMax, folderFilter, folderFilteringEnabled, function (data) {
    res.json(data);
  });
});

module.exports = router;
