var mysql = require('mysql2');
var config = require('../config_server');

var Database = function() {};

module.exports = Database;

Database.Init = function() {
	Database.db = mysql.createConnection(config.dbConnection);
};

Database.Get = function() {
	if (typeof Database.db === 'undefined') {
		Database.Init();
	}
	return Database.db;
};