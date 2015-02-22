var express = require('express');
var router = express.Router();

var http = require('http');
var fileSystem = require('fs');
var path = require('path');
var gm = require('gm');

function get_image(id, callback) {
    var connection = require('../routes/Database').Get();
    var query =
        'SELECT name FROM ' +
        'photomap_image WHERE id=' + connection.escape(id);

    connection.query(query,
        function(err, rows, fields) {
            if (err) throw err;
            callback(path.join('images', rows[0].name));
        }
    );
}

/* GET users listing. */
router.get('/:id/thumb', function(req, res, next) {
    get_image(req.params.id, function(data) {
        var filePath = data;
        gm(filePath).resize(200)
            .stream(function (err, stdout, stderr) {
                if (err) return next(err);
                res.set('Content-Type', 'image/jpeg');
                stdout.pipe(res); //pipe to response

                // the following line gave me an error compaining for already sent headers
                //stdout.on('end', function(){res.writeHead(200, { 'Content-Type': 'ima    ge/jpeg' });}); 

                stdout.on('error', next);
            });
    });
});

/* GET users listing. */
router.get('/:id/tiny', function(req, res, next) {
    get_image(req.params.id, function(data) {
        var filePath = data;
        gm(filePath).resize(40)
            .stream(function (err, stdout, stderr) {
                if (err) return next(err);
                res.set('Content-Type', 'image/jpeg');
                stdout.pipe(res); //pipe to response

                // the following line gave me an error compaining for already sent headers
                //stdout.on('end', function(){res.writeHead(200, { 'Content-Type': 'ima    ge/jpeg' });}); 

                stdout.on('error', next);
            });
    });
});

/* GET users listing. */
router.get('/:id', function(req, res, next) {
    get_image(req.params.id, function(data) {
        var filePath = data;
        var stat = fileSystem.statSync(filePath);

        res.writeHead(200, {
            'Content-Type': 'image/jpeg',
            'Content-Length': stat.size
        });

        var readStream = fileSystem.createReadStream(filePath);
        readStream.pipe(res);
    });
});

module.exports = router;