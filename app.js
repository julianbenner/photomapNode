var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var session = require('express-session');
var flash = require('connect-flash');
var passport = require('passport');

var count = require('./routes/count');

require('./routes/Database').Init();

var app = express();

app.use(morgan('dev')); // log every request to the console
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({
    extended: true
}));

require('./routes/passport');
app.use(session({
    secret: 'ilovescotchscotchyscotchscotch',
    saveUninitialized: true,
    resave: true
})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash());

app.set('views', './resources/views');
app.set('view engine', 'jade');


app.use(express.static(__dirname + '/public'));

app.use('/get_image_count', count);
app.use('/admin', require('./routes/admin')());

app.use('/', function(req, res) {
    res.render('index', {
        isMap: true,
        user: req.user
    });
});

// error handlers

// catch 404 and forward to error handlersno
app.use(function(req, res) {
    res.status(400);
    res.render('error', {
        title: 'Error 404',
        error: req.url + ' does not exist on this server.'
    });
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            error: err,
            message: err.stack
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        error: err
    });
});


module.exports = app;