var express = require('express');

var count = require('./routes/count');

require('./routes/Database').Init();

var app = express();

app.set('views', './resources/views');
app.set('view engine', 'jade');

app.use(express.static(__dirname + '/public'));




var passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy;

var users = [
  { id: 1, username: 'bob', password: 'secret', email: 'bob@example.com' },
  { id: 2, username: 'joe', password: 'birthday', email: 'joe@example.com' }
];

function findById(id, fn) {
  var idx = id - 1;
  if (users[idx]) {
    fn(null, users[idx]);
  } else {
    fn(new Error('User ' + id + ' does not exist'));
  }
}

function findByUsername(username, fn) {
  console.log(10);
  for (var i = 0, len = users.length; i < len; i++) {
    var user = users[i];
    if (user.username === username) {
      return fn(null, user);
    }
  }
  return fn(null, null);
}

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  findById(id, function (err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy(
  function(username, password, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      
      // Find the user by username.  If there is no user with the given
      // username, or the password is not correct, set the user to `false` to
      // indicate failure and set a flash message.  Otherwise, return the
      // authenticated `user`.
      findByUsername(username, function(err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
        if (user.password != password) { return done(null, false, { message: 'Invalid password' }); }
        return done(null, user);
      });
    });
  }
));

app.use(require('connect-flash')());
app.use(require('express-session')({secret:'hjdgft'}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/get_image_count', count);
app.use('/admin', require('./routes/admin')());

// error handlers

// catch 404 and forward to error handlersno
app.use(function(req, res) {
    res.status(400);
    res.render('error', {title: 'Error 404', error: req.url + ' does not exist on this server.'});
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