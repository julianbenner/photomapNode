'use strict';
var express = require('express');
var router = express.Router();

var helpers = require('./logic/helpers');
var config = require('../config_server');

function getImageList(lat_min, lat_max, lon_min, lon_max, dateMin, dateMax, folderFilter, folderFilteringEnabled, callback) {
  var connection = require('../routes/Database').Get();

  var constraints = 'lat BETWEEN ' + connection.escape(lat_min) + ' AND ' + connection.escape(lat_max) +
    ' AND lon BETWEEN ' + connection.escape(lon_min) + ' AND ' + connection.escape(lon_max);

  if (typeof dateMin !== 'undefined' && dateMin !== '')
    constraints += ' AND date > ' + connection.escape(dateMin);
  if (typeof dateMax !== 'undefined' && dateMax !== '')
    constraints += ' AND date < ' + connection.escape(dateMax);
  if (folderFilteringEnabled === true || folderFilteringEnabled === 'true') {
    const folderFilterQuery = helpers.folderFilterToConstraint(folderFilter);
    constraints += ' AND (1=0' + folderFilterQuery + ')';
  }

  var query = 'SELECT id, name FROM ' + config.databaseName +
    ' WHERE ' + constraints;
  connection.query(
    query, function (err, rows, fields) {
      if (err) throw err;
      callback(rows);
    });
}

router.post('/', function (req, res, next) {
  const latMin = req.body.latMin || 0;
  const latMax = req.body.latMax || 0;
  const lonMin = req.body.lonMin || 0;
  const lonMax = req.body.lonMax || 0;
  const dateMin = req.body.dateMin || undefined;
  const dateMax = req.body.dateMax || undefined;
  const folderFilter = req.body.folderFilter || {};
  const folderFilteringEnabled = req.body.folderFilteringEnabled || false;
  getImageList(latMin, latMax, lonMin, lonMax, dateMin, dateMax, folderFilter, folderFilteringEnabled, function (data) {
    res.json(data);
  });
});

module.exports = router;
