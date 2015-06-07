var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var passport = require('passport');
var url = require('url');
var multer = require('multer');

var count = require('./routes/count');

require('./routes/Database').Init();

var React = require('react/addons');

var config = require('./config_server');

var app = express();
app.use(morgan('dev')); // log every request to the console
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(multer({
  dest: config.tempPath
}));

require('./routes/passport');
app.use(passport.initialize());

app.use(express.static(__dirname + '/public'));

app.use('/get_image_count', count);
app.use('/get_image_list', require('./routes/list'));
app.use('/user', require('./routes/user'));
app.use('/get_folder_content', require('./routes/folder'));
app.use('/admin', require('./routes/admin')());
app.use('/image', require('./routes/image'));

// error handlers

// catch 404 and forward to error handlers
app.use(function(req, res) {
    res.status(404).send('404');
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        console.log(err.stack);
        res.status(err.status || 500).send(err.stack);
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500).send(err);
});


module.exports = app;