'use strict';
var express = require('express');
var router = express.Router();
var Promise = require('promise');
var passport = require('passport');
var auth = require('./logic/auth');

router.post('/login',
  passport.authenticate('local'), function(req, res) {
    res.status(200).send(auth.userToToken(req.user.username));
  });

module.exports = router;
