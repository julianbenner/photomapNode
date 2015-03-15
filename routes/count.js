var express = require('express');
var router = express.Router();

var is_production = function() {
    try {
        return express().get('env') === 'production';
    } catch (e) {
        return false;
    }
};

function get_image_count(lat_min, lat_max, lon_min, lon_max, dateMin, dateMax, callback) {
    var connection = require('../routes/Database').Get();
    
    var constraints = 'lat BETWEEN '+connection.escape(lat_min)+' AND '+connection.escape(lat_max)+
                 ' AND lon BETWEEN '+connection.escape(lon_min)+' AND '+connection.escape(lon_max);

    if (typeof dateMin !== 'undefined' && dateMin !== '')
        constraints += ' AND date > ' + connection.escape(dateMin);
    if (typeof dateMax !== 'undefined' && dateMax !== '')
        constraints += ' AND date < ' + connection.escape(dateMax);

    var query = 'SELECT image_count, slat/image_count as avg_lat, slon/image_count as avg_lon FROM ' +
    '(SELECT COUNT(*) as image_count, SUM(lat) as slat, SUM(lon) as slon FROM ' +
    'photomap_image WHERE ' + constraints + ') t';

    if (!is_production())
    console.log(query);

    connection.query(query, function(err, rows, fields) {
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

router.get('/', function(req, res, next) {
    get_image_count(req.query.latMin, req.query.latMax, req.query.lonMin, req.query.lonMax, req.query.dateMin, req.query.dateMax, function(data) { res.json(data); });
});

module.exports = router;
