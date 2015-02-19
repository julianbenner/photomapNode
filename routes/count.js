var express = require('express');
var router = express.Router();

function get_image_count(lat_min, lat_max, lon_min, lon_max, callback) {
    var connection = require('../routes/Database').Get();

    var query = 'SELECT image_count, slat/image_count as avg_lat, slon/image_count as avg_lon FROM ' +
        '(SELECT COUNT(*) as image_count, SUM(lat) as slat, SUM(lon) as slon FROM ' +
        'photomap_image WHERE lat BETWEEN '+connection.escape(lat_min)+' AND '+connection.escape(lat_max)+' AND lon BETWEEN '+connection.escape(lon_min)+' AND '+connection.escape(lon_max)+') t';
    connection.query(
        query, function(err, rows, fields) {
        if (err) throw err;
        callback(rows[0]);
    });
}

/* GET users listing. */
router.get('/:lat_min,:lat_max,:lon_min,:lon_max', function(req, res, next) {
console.log('lol');
  //res.send(req.params.lat_min + req.params.lon_max);
    get_image_count(req.params.lat_min, req.params.lat_max, req.params.lon_min, req.params.lon_max, function(data) { res.json(data); });
});

module.exports = router;
