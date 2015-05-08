var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var session = require('express-session');
var flash = require('connect-flash');
var passport = require('passport');
var url = require('url');

var count = require('./routes/count');

require('./routes/Database').Init();

var React = require('react/addons');
//require('node-jsx').install({harmony: true, extension: '.jsx'});
//bootstrap = require('bootstrap');
//var ReactApp = React.createFactory(require('./resources/javascript/components/Application'));
//var ReactTopBar = React.createFactory(require('./resources/javascript/components/TopBar'));
//var ReactProps = React.createFactory(require('./resources/javascript/components/Props'));

var app = express();

app.get('/prerender', function(req, res) {
    url.parse
  res.render('index', {
      react: React.renderToString(ReactApp({token: "pk.eyJ1IjoianVsaWFuYmVubmVyIiwiYSI6Imo3VGM4QVkifQ.69vtm3yG3cQWalRZM0tdYA"})),
      topBar: React.renderToString(ReactTopBar({})),
      props: React.renderToString(ReactProps({lat: 20.0}))
    });
});

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
app.use('/get_image_list', require('./routes/list'));
app.use('/login', require('./routes/login'));
app.use('/get_folder_content', require('./routes/folder'));
app.use('/admin', require('./routes/admin')());
app.use('/image', require('./routes/image'));

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