var jwt = require('jwt-simple');
var secret = 'xxx'; // TODO

function validTokenAge (tokenTime) {
  const currentTime = new Date();
  return (Math.floor(currentTime) - (tokenTime || 0)) < 60*60*1000;
}

module.exports = {
  tokenToUser: function(token) {
    const decoded = jwt.decode(token, secret);
    if (validTokenAge(decoded.time)) {
      return decoded.user;
    } else {
      return null;
    }
  },

  userToToken: function(user) {
    const payload = {
      user: user,
      time: Math.floor(new Date())
    };
    return jwt.encode(payload, secret);
  }
};