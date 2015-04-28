'use strict';

/**
 * Method to add a key on the collection
 * 
 */

// Modules
var Key = require('./../model/mongo/key'),
  Collection = require('./../model/collection');

/**
 * Parameter regexp
 */
var keyRegexp = {
  domain: /^([a-z0-9-_]+\.)+[a-z]{2,4}(\/[a-z0-9-_]+)*\/?$/i,
  email: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
};


module.exports = function (options, callback) {
  var error;

  // Start parameter checking
  if (!keyRegexp.email.test(options.email)) {
    error = 'Your email address is not valid.';
  }
  else if (!keyRegexp.domain.test(options.domain)) {
    error = 'Your domain pattern is not valid.';
  }
  else if (!options.tcs) {
    error = 'You must agree the terms and conditions.';
  }

  if (error) {
    callback(null, error);
    return;
  }

  // Create the object
  var item = {
    _id: Collection.prototype.generateKey(24),
    multipleConnection: 8,
    domain: options.domain.toLowerCase(),
    email: options.email.toLowerCase(),
    createdAt: (new Date()).getTime(),
    enabled: false
  };

  item.expiryDate = item.createdAt + 172800000; // Add two years

  // Insert in the collection
  // Check if the email address is already in the collection
  var key = new Key();
  
  key
    .isIdExists(item._id)
    .then(function () {
      // If the key already exists, we stop here
      callback(null, 'An error has occured, please try again.');
      throw 'Key request: try to insert an existing ID';
    }, function () {
      return key.find({email: options.email});
    })
    .then(function () {
      // If the email already exists, we stop here
      callback(null, 'This email address is already registered.');
      throw 'Key request: try to insert an existing email';
    }, function () {
      key.data = item;
      return key.save();
    })
    .then(function () {
      callback('Your request is saved.', null);
    }, function (e) {
      callback(null, 'An error has occured, please try again.');
      throw 'Key request: impossible to save the object';
    });
};