'use strict';

// Imports
var MongoModel = require('./mongoModel'),
		util = require('util');


/**
 * Key
 * {
 * 	 _id: 'harD3r83tt3R7a5t3r5t0ngR',
 * 	 multipleConnection: 32,
 * 	 domain: '//liwe.co',
 *	 email: 'max@liwe.co'
 *	 createdAt: 1234567890,
 *	 expiryDate: 2234567890
 * }
 *
 * @param {object} data Data to set in the object
 */
function Key (data) {

	// Call the master
	Key.super_.apply(this, ['keys', data]);
	this.data.expiryDate = this.data.expiryDate || (new Date()).getTime();
}
util.inherits(Key, MongoModel);

/**
 * isValid
 * @param		{Boolean} isDestructive		Marker to throw error if the object is not valid
 * @return	{Boolean}									Boolean to know if the object is valid
 */
Key.prototype.isValid = function (isDestructive) {
	var dt = this.data;
	var errors = [];
	if (!dt._id || dt._id.constructor !== String) {
		errors.push('The attribute "_id" is required and must be a string');
	}
	if (!dt.expiryDate || dt.expiryDate.constructor !== Number) {
		errors.push('The attribute "expiryDate" is required and must be a number');
	}
	if (!dt.email || dt.email.constructor !== String) {
		errors.push('The attribute "email" is required and must be a string');
	}
	if (!dt.domain || dt.domain.constructor !== String) {
		errors.push('The attribute "domain" is required and must be a string');
	}
	if (!dt.windowLimitConn || dt.windowLimitConn.constructor !== Number) {
		errors.push('The attribute "windowLimitConn" is required and must be a number');
	}

	if (!!isDestructive && isDestructive && errors.length !== 0) {
		throw new Error(errors.join('\n'));
	}
	return (errors.length === 0);
};

module.exports = Key;
