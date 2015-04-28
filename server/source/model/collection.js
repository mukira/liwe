'use strict';

/**
 * Collection
 * The WindowSocket keeper, it manage them.
 * Built to work with any type of objects, not
 * only RemoteSockets and WindowSockets.
 * It tkae only one argument, which is not required,
 * 
 * @param {integer} keyLength Key length (default: 6)
 */
function Collection (keyLength) {
	this.list = {};
	this.keyLength = keyLength || 6;
}

/**
 * add
 * simple method to create a new WindowSocket
 * and add it to the collection.
 *
 * @param {*}      value Item to add in the collection
 * @param {string} id    Id of the item
 * @return {string} Id used to store the item, or undefined if error   
 */
Collection.prototype.add = function (value, id) {
	if (!id) {
		id = this.generateId();
	}
	else if (typeof id !== 'string' || id.length !== this.keyLength) {
		return;
	}
	this.list[id] = value;
	return id;
};

/**
 * remove
 * delete an item from the list
 * 
 * @param {string} id ID of the item to remove
 */
Collection.prototype.remove = function (id) {
	delete this.list[id];
};

/**
 * get
 * get an item from the list
 * 
 * @param  {string} id ID of the item to get
 * @return {*}         The item
 */
Collection.prototype.get = function (id) {
	return this.list[id];
};

/**
 * generateKey
 * generate a random key with the length
 * of your choice, and return it
 *
 * @param  {[string]} length Length of the id
 * @return {[string]}        The id
 */
Collection.prototype.generateKey = function (length) {
	var output = '';
	var src = 'bcdfghjklmnpqrstvwxz';
	while (length > 0) {
		output += src[Math.floor(Math.random()*20)];
		length--;
	}
	return output;
};

/**
 * generateId
 * generate an available id to be used as
 * remoteId
 *
 * @return {[string]}        The id
 */
Collection.prototype.generateId = function () {
	var id;
	do {
		id = this.generateKey(this.keyLength);
	} while (this.list[id]);
	return id;
};

// Export
module.exports = Collection;