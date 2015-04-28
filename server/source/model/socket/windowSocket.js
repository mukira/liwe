'use strict';

// Imports
var SocketModel = require('./socketModel'),
		Key = require('./../mongo/key'),
		config = require('./../../../../config'),
		util = require('util');


/**
 * WindowSocket
 * Object defining a socket for a window.
 * Got the basic method and can extanded to future
 * evolution of the system. Each instance is linked
 * to a collection where all windows are stored.
 *
 * Param object must contain:
 * 	domain {string}
 * 	keyId {string}
 * 	maxRemoteConn {integer}
 * 
 * @param {object} socket     SockJS socket instance to window
 * @param {object} params     Connection parameters
 * @param {object} collection WindowSocket collection
 */
function WindowSocket (socket, params, collection) {
	// Save the objects
	this.socket = socket;
	this.collection = collection;

	// Check the parameters then start
	if (!this._constructorCheck(params)) {
		this.close();
		return;
	}
	this._start(params);
}
util.inherits(WindowSocket, SocketModel);


/**
 * Public interface
 **********************************************************
 */

/**
 * addRemote
 * Add a remote in the to the instance.
 * It take a RemoteSocket as parameter and link
 * it to the current instance.
 * 
 * @param {RemoteSocket} remote RemoteSocket instance to add to the window
 */
WindowSocket.prototype.addRemote = function (remote) {
	this.remotes[remote.id] = remote;
	this.remotesConnected++;

	// Give signal to the window
	this.send('new_remote', {
		uiAllowed: remote.uiAllowed,
		color: remote.color
	}, {
		remoteId: remote.id
	});
};

/**
 * setUIonRemote
 * Set a UI on a RemoteSocket from his ID and
 * the UI name to set.
 * 
 * @param {string} remoteId Remote ID
 * @param {string} uiName   UI name
 */
WindowSocket.prototype.setUIonRemote = function (remoteId, uiName, message) {
	// Get the remote
	var remoteObj = this.remotes[remoteId];

	// Check if the remote exists
	if (!remoteObj) {
		return this.sendError('set_ui', 'Unexisting remote');
	}
	if (!remoteObj.setUi(uiName, message)) {
		return this.sendError('set_ui', 'UI not accepted by this remote');
	}
};

/**
 * canAcceptNewRemote
 * Check to know if the window can accept a
 * new remote.
 *
 * @return {boolean} True if it can
 */
WindowSocket.prototype.canAcceptNewRemote = function () {
	// It's simple, for the moment
	return this.maxRemoteConn > this.remotesConnected;
};

/**
 * disconnectRemote
 * Disconnect a remote from his ID. To respect remote
 * disconnection protocol, `wasSuccess` and `message`
 * must be given to inform the remote
 * 
 * @param {string}  remoteId   RemoteSocket ID
 * @param {string}  message    Disconnection message
 * @param {boolean} wasSuccess Marker to make the disconnection a success
 */
WindowSocket.prototype.disconnectRemote = function (remoteId, message, wasSuccess) {
	var remoteObj = this.remotes[remoteId];

	// Check if the remote exists
	if (!remoteObj) {
		return this.sendError('disconnect_remote', 'Unexisting remote');
	}
	remoteObj.disconnect(message, wasSuccess);
};

/**
 * removeRemote
 * Remove a remote from his ID. 
 * But just from this instance.
 * It does not have any effect on the remote instance.
 * 
 * @param {string}  remoteId   RemoteSocket ID
 */
WindowSocket.prototype.removeRemote = function (remoteId) {
	this.send('close_remote', {}, {
		remoteId: remoteId
	});
	this.remotesConnected--;
	delete this.remotes[remoteId];
};

/**
 * disconnect
 * Method to disconnect the WindowSocket instance
 * and all his connected remotes.
 * 
 */
WindowSocket.prototype.disconnect = function () {
	// Let disconnect remotes
	for (var i in this.remotes) {
		this.disconnectRemote(i, 'Sorry bud! The app is disconnected.', false);
	}

	// Close the current socket
	this.collection.remove(this.id);
	this.close();

	// Remove some links for the garbage collector
	if (this.socket) {
		this.socket.card = null;
		this.socket      = null;
	}
	this.collection  = null;
};


/**
 * Private interface
 **********************************************************
 */

/**
 * _constructorCheck
 * Private method to check the params from the
 * constructor
 * 
 * @param  {object}  params Param from the `connect` event
 * @return {boolean}        True if success
 */
WindowSocket.prototype._constructorCheck = function (params) {
	if (!params || typeof params.keyId !== 'string' || typeof params.domain !== 'string') {
		this.sendStatusError('Invalid request');
		return false;
	}
	return true;
};

/**
 * _start
 * Method to start the instance.
 * Begin to check the key from the connection
 * event then check the domain and connection limit.
 * If everything is alright, the socket is ready to start.
 * 
 * @param  {object}  params Param from the `connect` event
 */
WindowSocket.prototype._start = function (params) {
	// Get the key infos and test the brousouf
	var key = new Key();
	key
		.findById(params.keyId)
		.then(function (data) {

		// Check if the key is valid
		if (!data.enabled) {
			this.sendStatusError('Unexisting key');
			this.disconnect();
		}

		// // Check multi connections
		// if (data.multipleConnection > this.windowOnThisKey()) {
		// 	this.sendStatusError('Maximum connections reached');
		// 	this.disconnect();
		// }
		
		// Check domain
		if (!urlPatternCheck(data.domain, params.domain)) {
			this.sendStatusError('This domain is not allowed to use this key');
			this.disconnect();
		}

		// Store the window properties
		this.id = this.collection.add(this);
		this.keyId = params.keyId;
		this.keyInfo = data;
		this.maxRemoteConn = params.maxRemoteConn;
		this.remotesConnected = 0;
		this.remotes = {};

		this.socket.card = this;

		this.sendStatusSuccess({
			windowId: this.id,
			url: 'http://' + config.app.domain + '/' + this.id
		});
	}.bind(this),
	function (err) {
		this.sendStatusError('Unexisting key');
		this.disconnect();
	}.bind(this));
};

// Scope methods
function urlPatternCheck (pattern, url) {
	var protocolIndex, patternIndex;

	protocolIndex = url.indexOf('://');
	if (protocolIndex !== -1) {
		url = url.slice(protocolIndex + 3);
	}

	patternIndex = url.indexOf(pattern);
	return patternIndex !== -1 && url.slice(0, patternIndex).indexOf('/') === -1;
}

// Export
module.exports = WindowSocket;