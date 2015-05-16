'use strict';

var Promise = require('promise');
var config = require('../../config_server');
var crypto = require('crypto');

module.exports = {
  folderFilterToConstraint: function(folderFilter) {
    var connection = require('../../routes/Database').Get();
    const selected = folderFilter.selected === 'true' || folderFilter.selected === true;
    const thisConstraint = selected ? ' OR path = ' + connection.escape(folderFilter.name) : '';
    let childrenConstraint = '';
    if (folderFilter.allSubfoldersSelected !== 'true' && folderFilter.allSubfoldersSelected !== true) {
      if (typeof folderFilter.content !== 'undefined')
        childrenConstraint = folderFilter.content.map(function (child) {
          if (typeof child !== 'undefined' && child !== '')
            return this.folderFilterToConstraint(child);
          else
            return '';
        }).join('');
    } else {
      childrenConstraint = ' OR path LIKE ' + connection.escape(folderFilter.name + '%');
    }
    return thisConstraint + childrenConstraint;
  },

  generatePasswordHashPromise: function(password) {
    return new Promise(function (resolve, reject)  {
      crypto.randomBytes(32, function(err, buf) {
        const salt = buf.toString('hex');
        crypto.pbkdf2(password, salt, config.hashIterations, 64, 'sha256', function (err, hash) {
          if (err)
            reject(err);
          else {
            resolve(salt + ':' + hash.toString('hex') + ':' + config.hashIterations);
          }
        });
      });
    })
  },

  verifyPasswordHashPromise: function(password, hash) {
    return new Promise(function (resolve, reject) {
      const splitHash = hash.split(':');
      if (splitHash.length === 3) {
        const hashSalt = splitHash[0];
        const hashIterations = splitHash[2];

        crypto.pbkdf2(password, hashSalt, parseInt(hashIterations), 64, 'sha256', function(err, generatedHash) {
          if (err)
            reject(err);
          else {
            if (hash === hashSalt + ':' + generatedHash.toString('hex') + ':' + config.hashIterations) {
              resolve(true);
            } else {
              resolve(false);
            }
          }
        });
      } else {
        reject('Hash invalid!');
      }
    })
  }
};