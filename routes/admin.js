var express = require('express');
var path = require('path');
var passport = require('passport');

function get_list_of_images(amount, page, callback) {
  var connection = require('../routes/Database').Get();

  page = parseInt(page);
  page = isNaN(page) ? 1 : page;
  amount = parseInt(amount);
  amount = isNaN(amount) ? 10 : amount;

  var start_from = connection.escape(amount * (page - 1));
  amount = connection.escape(amount);

  var query = 'SELECT * FROM photomap_image ORDER BY path,name LIMIT ' + start_from + ', ' + amount;
  console.log(query);
  connection.query(
    query,
    function(err, rows, fields) {
      if (err) throw err;
      callback(rows);
    });
}

function user_is_admin(request) {
  return true; // TODO
}

module.exports = function admin() {
  var router = express.Router();

  var relPath = '/admin';

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

  router.get('/list', function(req, res) {
    if (user_is_admin(req)) {
      get_list_of_images(req.query.amount, req.query.page, function(result) {
        res.json(result);
      });
    } else {
      res.sendStatus(401);
    }
  });

  return router;
};