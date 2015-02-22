var express = require('express');
var router = express.Router();

function get_image_list(lat_min, lat_max, lon_min, lon_max, callback) {
    var connection = require('../routes/Database').Get();

    var query = 'SELECT id, name FROM ' +
        'photomap_image WHERE lat BETWEEN '+connection.escape(lat_min)+' AND '+connection.escape(lat_max)+' AND lon BETWEEN '+connection.escape(lon_min)+' AND '+connection.escape(lon_max);
    connection.query(
        query, function(err, rows, fields) {
        if (err) throw err;
        callback(rows);
    });
}

router.get('/:lat_min,:lat_max,:lon_min,:lon_max', function(req, res, next) {

  //res.send(req.params.lat_min + req.params.lon_max);
    get_image_list(req.params.lat_min, req.params.lat_max, req.params.lon_min, req.params.lon_max, function(data) { res.json(data); });
});

module.exports = router;
