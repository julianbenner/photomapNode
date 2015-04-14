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
        if (!gm)
            console.err("Could not run GraphicksMagic");
        gm(filePath).resize(200)
            .stream(function (err, stdout, stderr) {
                if (err) return next(err);
                res.set('Content-Type', 'image/jpeg');
                stdout.pipe(res);

                stdout.on('error', next);
            });
    });
});

// tiny: 40 width
router.get('/:id/tiny', function(req, res, next) {
    get_image(req.params.id, function(data) {
        var filePath = data;
        gm(filePath).resize(40)
            .stream(function (err, stdout, stderr) {
                if (err) return next(err);
                res.set('Content-Type', 'image/jpeg');
                stdout.pipe(res);

                stdout.on('error', next);
            });
    });
});

// medium: 1000 height
router.get('/:id/medium', function(req, res, next) {
    get_image(req.params.id, function(data) {
        var filePath = data;
        var file = gm(filePath);

        var height = 1000;

        if (getImageHeight(file) > height) {
            imageResize(file, null, height, res, next);
        } else {
            imageOriginal(filePath, res, next);
        }
    });
});

function getImageHeight(image) {
    image.size(function(err, value) {
        if (value.height) {
            return value.height;
        } else {
            return 0;
        }
    });
}

// huge: 2000 height
router.get('/:id/huge', function(req, res, next) {
    get_image(req.params.id, function(data) {
        var filePath = data;
        var file = gm(filePath);

        var height = 2000;

        if (getImageHeight(file) > height) {
            imageResize(file, null, height, res, next);
        } else {
            imageOriginal(filePath, res, next);
        }
    });
});

/* GET users listing. */
router.get('/:id', function(req, res, next) {    
    get_image(req.params.id, function(data) {
        imageOriginal(data, res, next);
    });
});

function imageResize(file, width, height, res, next) {
    file.resize(width, height)
        .stream(function (err, stdout, stderr) {
            if (err) return next(err);
            res.set('Content-Type', 'image/jpeg');
            stdout.pipe(res);

            stdout.on('error', next);
        });
}

function imageOriginal(filePath, res, next) {
    var stat = fileSystem.statSync(filePath);

    res.writeHead(200, {
        'Content-Type': 'image/jpeg',
        'Content-Length': stat.size
    });

    var readStream = fileSystem.createReadStream(filePath);
    readStream.pipe(res);
}

module.exports = router;