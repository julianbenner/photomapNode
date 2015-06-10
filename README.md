# PhotoMap

## Description
PhotoMap is a tool to help you visualize locations you have taken photos in and quickly find them on a map.

It is realized with Node.js as backend and a React-based single-page-application frontend.

## Installation

### Prerequisites
#### MariaDB
PhotoMap utilizes an SQL database as data storage. While it was written with MariaDB 10.0 in mind, it should work with MySQL and other versions of MariaDB. You can use this snippet to initialize the database:
```sql
CREATE DATABASE IF NOT EXISTS `photomap`
USE `photomap`;
CREATE TABLE IF NOT EXISTS `photomap_image` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `path` varchar(1024) NOT NULL,
  `date` datetime DEFAULT NULL,
  `lat` float DEFAULT NULL,
  `lon` float DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
CREATE TABLE IF NOT EXISTS `photomap_user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(25) NOT NULL,
  `password` varchar(200) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
INSERT INTO `photomap_user` (`name`, `password`)  VALUES ('admin', '120a9bda6f97b1ce28d8a362289056909666e294ade2fb743e46b9b9b1fcf187:97ff3ca333046ac90fa7c73e6c64d77412023bd7006a0e608c8a54bbb1b516e947d15903cdd82062e3ca86e7fc7f7cc5faf5b7f79dd2f05a42d16cae769686c5:1000');
```

This will inizialize the database with a user called admin with password admin. Feel free to change the username if you need to. If you need to alter the schema, please also adjust the config files (see further below).

#### Node.js
As we utilize some ES6 features, we recommend using a current version of io.js (tested with 2.2.1), but Node.js should also work (with the ```--harmony``` flag). In order to install some of the necessary packages with NPM, you need several external programs:
* Python 2.7
* Visual Studio 2013 (C++ and C\#) for Windows
* Ruby
This list may not be exhaustive. In case ```npm install``` fails, please read the error messages as it might very well be a missing external dependency.

### PhotoMap installation
#### NPM
Dependencies are managed exclusively with NPM. Run ```npm install``` in the root folder to install all necessary packages.

#### Configuration
As of yet, configuration is managed separately for server and client. Adjust server settings (such as database connection) in ```/config_server.js```. Client settings can be found in ```/resources/javascript/config_client.js```.

#### Compilation
Assets are compiled using Gulp. You can run ```gulp watch``` for development (triggering a re-compile whenever changes to the JavaScript or SCSS files are detected). For production, just run ```gulp```. This will build minimized versions of all necessary files.

#### Run PhotoMap
When all is set, you can simply run ```node bin/www```. However, in production you might want to use a wrapper such as pm2 for automated restarts upon server failure (e.g. ```pm2 start bin/www```).
