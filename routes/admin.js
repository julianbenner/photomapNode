var express = require('express');
var passport = require('passport');
var flash = require('connect-flash');
var session = require('express-session');
var path = require('path');
var LocalStrategy = require('passport-local').Strategy;

function get_image_count(lat_min, lat_max, lon_min, lon_max, callback) {
  var query = 'SELECT image_count, slat/image_count as avg_lat, slon/image_count as avg_lon FROM ' +
    '(SELECT COUNT(*) as image_count, SUM(lat) as slat, SUM(lon) as slon FROM ' +
    'photomap_image WHERE lat BETWEEN ' + connection.escape(lat_min) + ' AND ' + connection.escape(lat_max) + ' AND lon BETWEEN ' + connection.escape(lon_min) + ' AND ' + connection.escape(lon_max) + ') t';
  connection.query(
    query,
    function(err, rows, fields) {
      if (err) throw err;
      callback(rows[0]);
    });
}

var users = [{
  id: 1,
  username: 'bob',
  password: 'secret',
  email: 'bob@example.com'
}, {
  id: 2,
  username: 'joe',
  password: 'birthday',
  email: 'joe@example.com'
}];

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  findById(id, function(err, user) {
    done(err, user);
  });
});

function findById(id, fn) {
  var idx = id - 1;
  if (users[idx]) {
    fn(null, users[idx]);
  } else {
    fn(new Error('User ' + id + ' does not exist'));
  }
}

function findByUsername(username, fn) {
  for (var i = 0, len = users.length; i < len; i++) {
    var user = users[i];
    if (user.username === username) {
      return fn(null, user);
    }
  }
  return fn(null, null);
}

passport.use(new LocalStrategy(
  function(username, password, done) {
    // asynchronous verification, for effect...
    process.nextTick(function() {

      // Find the user by username.  If there is no user with the given
      // username, or the password is not correct, set the user to `false` to
      // indicate failure and set a flash message.  Otherwise, return the
      // authenticated `user`.
      findByUsername(username, function(err, user) {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false, {
            message: 'Unknown user ' + username
          });
        }
        if (user.password != password) {
          return done(null, false, {
            message: 'Invalid password'
          });
        }
        return done(null, user);
      })
    });
  }
));

module.exports = function admin() {
  var router = express.Router();

  var relPath = '/admin';

  router.use(session({
    secret: 'ilovescotchscotchyscotchscotch'
  })); // session secret
  router.use(passport.initialize());
  router.use(passport.session()); // persistent login sessions
  router.use(flash());

  router.post('/login',
    passport.authenticate('local', {
      failureRedirect: 'login',
      failureFlash: true
    }),

    function(req, res) {
      res.redirect(path.join(relPath, '/'));
    });

  router.get('/', function(req, res) {
    res.render('admin', {
      user: req.user
    });
  });

  router.get('/login', function(req, res) {
    if (req.user) {
      res.redirect(path.join(relPath, '/'));
    } else {
      res.render('login', {
        message: req.flash('error'),
        user: req.user
      });
    }
  });

  router.get('/logout', function(req, res) {
    req.logout();
    res.redirect(path.join(relPath, '/'));
  });

  return router;
};