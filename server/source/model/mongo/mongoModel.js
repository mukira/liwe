'use strict';

// Imports
var Q = require('q');
var db = require('./../../system/db');


/**
 * MongoModel
 * abstract model layer for ORM architecture
 *
 * @param {string} collection Collection name
 * @param {object} data       Data to set in the object
 */
function MongoModel (collection, data) {
  if (!collection || collection.constructor !== String) {
    throw new Error('Collection name is required');
  }
  // else if (dbMap[collection]) {
  //   throw 'This collection does not exists';
  // }
  this.collection = collection;
  this.data = (!!data && data.constructor === Object) ? data : {};
}


/**
 * Basic interaction with Mongo
 * ----------------------------------------------
 */

/**
 * find
 * @param  {object} params Object of param to make the request
 * @return {promise}       Promise
 */
MongoModel.prototype.find = function (params) {
  var q = Q.defer();
  var self = this;
  db[this.collection].find(params, function (err, data) {
    if (!!data && data.length === 1) {
      self.data = data[0];
      q.resolve(data[0]);
    }
    else {
      q.reject();
    }
  });
  return q.promise;
};

/**
 * save
 * @return {promise} Promise
 */
MongoModel.prototype.save = function () {
  var q = Q.defer();
  var self = this;
  db[this.collection].save(this.data, function (err, data) {
    if (!!data) {
      self.data = data;
      q.resolve(data);
    }
    else {
      q.reject();
    }
  });
  return q.promise;
};

/**
 * remove
 * @return {promise} Promise
 */
MongoModel.prototype.remove = function () {
  var q = Q.defer();
  var self = this;
  db[this.collection].remove({_id: this.id()}, function (err, data) {
    if (!!data) {
      self.data = {};
      q.resolve();
    }
    else {
      q.reject();
    }
  });
  return q.promise;
};


/**
 * Accessibility layer
 * ----------------------------------------------
 */

/**
 * findById
 * @param  {string} id Id of the object to find
 * @return {promise}   Promise
 */
MongoModel.prototype.findById = function (id) {
  return this.find({_id: id});
};

/**
 * isIdExists
 * @param  {string} id Id of the object to find
 * @return {promise}   Promise
 */
MongoModel.prototype.isIdExists = function (id) {
  var q = Q.defer();
  var self = this;
  db[this.collection].find({_id: id}, function (err, data) {
    if (!!data && data.length === 1) {
      q.resolve(data[0]);
    }
    else {
      q.reject(err);
    }
  });
  return q.promise;
};


/**
 * Getters and setters
 * ----------------------------------------------
 */

/**
 * get
 * @param  {string} attribute Name of the attribute to get
 * @return {*}                Value
 */
MongoModel.prototype.get = function (attribute) {
  return this.data[attribute];
};

/**
 * set
 * @param   {string}  attribute Name of the attribute to set
 * @param   {*}       value     Value to set
 * @return  {boolean} True if the operation is a success
 */
MongoModel.prototype.set = function (attribute, value) {
  if (attribute === '_id') {
    return false;
  }
  this.data[attribute] = value;
  return true;
};

/**
 * id
 * @return {string} Object ID
 */
MongoModel.prototype.id = function () {
  return !!this.data._id ? this.data._id : false;
};

module.exports = MongoModel;
