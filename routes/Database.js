var mysql = require('mysql');

var Database = function() {};

module.exports = Database;

Database.Init = function() {
	Database.db = mysql.createConnection({
		host: '10.8.0.1',
		port: 33061,
		user: 'banane',
		password: 'banane',
		database: 'photomap'
	});
};

Database.Get = function() {
	if (typeof Database.db === 'undefined') {
		Database.Init();
	}
	return Database.db;
};