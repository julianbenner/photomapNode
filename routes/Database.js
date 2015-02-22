var mysql = require('mysql');

var Database = function() {};

module.exports = Database;

Database.Init = function() {
	Database.db = mysql.createConnection({
		host: '127.0.0.1',
		port: 3306,
		user: 'root',
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