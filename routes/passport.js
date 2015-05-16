var passport = require('passport');
var flash = require('connect-flash');
var session = require('express-session');
var LocalStrategy = require('passport-local').Strategy;

var helpers = require('./logic/helpers');

const connection = require('../routes/Database').Get();

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
}, {
  id: 3,
  username: 'admin',
  password: 'admin',
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
  /*for (var i = 0, len = users.length; i < len; i++) {
    var user = users[i];
    if (user.username === username) {
      return fn(null, user);
    }
  }*/
  const query = 'SELECT id, password FROM photomap_user WHERE name = ' + connection.escape(username);
  connection.query(query, function (err, rows, fields) {
    if (err) {
      return fn(null, null);
    } else {
      if(rows.length === 1) {
        const user = {
          id: rows[0].id,
          username: username,
          password: rows[0].password
        };
        return fn(null, user);
      }
      return fn(null, null);
    }
  });
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
        helpers.verifyPasswordHashPromise(password, user.password).then(function (result) {
          if(!result)
            return done(null, false, {
              message: 'Invalid password'
            });
          else
            return done(null, user);
        }).catch( function (err) {
          console.log(err);
        });
      });
    });
  }
));