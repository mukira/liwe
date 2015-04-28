'use strict';

/**
 * MongoJS database connector
 * Shall we do that dynamic??
 *
 */
var mongojs = require('mongojs'),
  config = require('./../../../config');

// Check if the config if alriiiighte
if (!config.db.url) {
  throw 'The URL to MongoDB is missing in the config file (config.json)';
}

var databaseUrl = config.db.url; // "username:password@example.com/mydb"
var collections = ['keys'];
var db = mongojs.connect(databaseUrl, collections);

module.exports = db;