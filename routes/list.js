var express = require('express');
var router = express.Router();

function get_image_list(lat_min, lat_max, lon_min, lon_max, dateMin, dateMax, callback) {
    var connection = require('../routes/Database').Get();
    
    var constraints = 'lat BETWEEN '+connection.escape(lat_min)+' AND '+connection.escape(lat_max)+
                 ' AND lon BETWEEN '+connection.escape(lon_min)+' AND '+connection.escape(lon_max);

    if (typeof dateMin !== 'undefined' && dateMin !== '')
        constraints += ' AND date > ' + connection.escape(dateMin);
    if (typeof dateMax !== 'undefined' && dateMax !== '')
        constraints += ' AND date < ' + connection.escape(dateMax);

    var query = 'SELECT id, name FROM ' +
        'photomap_image WHERE ' + constraints;
    connection.query(
        query, function(err, rows, fields) {
        if (err) throw err;
        callback(rows);
    });
}

router.get('/', function(req, res, next) {
    get_image_list(req.query.latMin, req.query.latMax, req.query.lonMin, req.query.lonMax, req.query.dateMin, req.query.dateMax, function(data) { res.json(data); });
});

module.exports = router;
