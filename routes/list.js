'use strict';
var express = require('express');
var router = express.Router();

function folderFilterToConstraint(folderFilter) {
  var connection = require('../routes/Database').Get();
  const selected = folderFilter.selected === 'true' || folderFilter.selected === true;
  const thisConstraint = selected ? ' OR path = ' + connection.escape(folderFilter.name) : '';
  let childrenConstraint = '';
  if (typeof folderFilter.content !== 'undefined')
    childrenConstraint = folderFilter.content.map(function (child) {
      if (typeof child !== 'undefined' && child !== '')
        return folderFilterToConstraint(child);
      else
        return '';
    }).join('');
  return thisConstraint + childrenConstraint;
}

function get_image_list(lat_min, lat_max, lon_min, lon_max, dateMin, dateMax, folderFilter, folderFilteringEnabled, callback) {
  var connection = require('../routes/Database').Get();

  var constraints = 'lat BETWEEN ' + connection.escape(lat_min) + ' AND ' + connection.escape(lat_max) +
    ' AND lon BETWEEN ' + connection.escape(lon_min) + ' AND ' + connection.escape(lon_max);

  if (typeof dateMin !== 'undefined' && dateMin !== '')
    constraints += ' AND date > ' + connection.escape(dateMin);
  if (typeof dateMax !== 'undefined' && dateMax !== '')
    constraints += ' AND date < ' + connection.escape(dateMax);
  if (folderFilteringEnabled === true || folderFilteringEnabled === 'true') {
    constraints += ' AND (1=0' + folderFilterToConstraint(folderFilter) + ')';
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
