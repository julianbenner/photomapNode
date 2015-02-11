var express = require('express');
var path = require('path');
var passport = require('../routes/passport.js');

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