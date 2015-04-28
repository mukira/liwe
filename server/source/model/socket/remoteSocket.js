'use strict';

// Imports
var SocketModel = require('./socketModel'),
		config = require('./../../../../config'),
		util = require('util');


/**
 * RemoteSocket
 * Object defining a socket for a remote.
 * Got the basic method and can extanded to future
 * evolution of the system. Each instance is linked
 * to a collection where all remotes are stored.
 *
 * Param object must contain:
 * 	windowId {string}
 * 	uiAllowed {array}
 * 
 * @param {object} socket     SockJS socket instance
 * @param {object} params     Params object from the `connection` event
 * @param {object} collection RemoteSocket collection
 * @param {object} window     WindowSocket object
 */
function RemoteSocket (socket, params, collection, window) {
	this.socket = socket;
	this.collection = collection;
	this.window = window;

	// Check the parameters
	if (!this._constructorCheck(params)) {
		this.close();
		return;
	}
	this._start(params);
}
util.inherits(RemoteSocket, SocketModel);


/**
 * Public interface
 **********************************************************
 */


/**
 * setUi
 * Set a UI on the RemoteSocket instance
 * with the UI name. If it's a success,
 * the method will return true.
 * 
 * @param {string} uiName UI name
 * @return {boolean} True if success
 */
RemoteSocket.prototype.setUi = function (uiName, message) {
	if (!this.isAllowedUI(uiName)) {
		return false;
	}
	this.send('set_ui', {
		ui: uiName,
		message: message
	});
	return true;
};

/**
 * isAllowedUI
 * Check if a UI is compatible with this remote
 * 
 * @param  {string}  uiName UI name
 * @return {boolean}        True is the UI is allowed
 */
RemoteSocket.prototype.isAllowedUI = function (uiName) {
	return this.uiAllowed.indexOf(uiName) !== -1;
};

/**
 * stream
 * Take the raw message to stream from the remote,
 * directly streamed to the window.
 * 
 * @param  {string}  rawMessage Message to send
 */
RemoteSocket.prototype.stream = function (rawMessage) {
	this.window.sendRaw(rawMessage);
};

/**
 * disconnect
 * Disconnect the instance and all dependencies to
 * let the garbage collector do his job.
 * 
 * @param  {string}  message    Disconnect message
 * @param  {boolean} wasSuccess True if the connection was a success
 */
RemoteSocket.prototype.disconnect = function (message, wasSuccess) {
	// Send the disconnect event
	this.send('disconnect', {
		wasSuccess: wasSuccess === undefined ? true : !!wasSuccess,
		message: message
	});

	// Close the current socket
	this.window.removeRemote(this.id);
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
 * @param  {object} params Param from the `connect` event
 * @return {boolean}       True if it's alright
 */
RemoteSocket.prototype._constructorCheck = function (params) {
	var responses, uiFilter = function (value) {
		return config.remote.uiList.indexOf(value) === -1;
	};

	// Check if the window exists
	if (!this.window) {
		responses = [
			'Errmm.. Listen buddy, I don\'t want to be rude but you made a mistake in the URL',
			'No, noooo...  the URL no good, nooo.. (check your URL)',
			'You were close, you made a mistake on the last characters of the URL'
		];
		this.sendStatusError(responses[Math.floor(Math.random()*2.99)]);
		return false;
	}

	// Check if the window can accept a new remote
	if (!this.window.canAcceptNewRemote()) {
		responses = [
			'Sorry bud\'..   The app has reached the maximum of connected remotes',
			'Listen the party is full, come back later',
			'We would like to welcome you, but the app is in overcapacity'
		];
		this.sendStatusError(responses[Math.floor(Math.random()*2.99)]);
		return false;
	}

	// Check if the UI list is correct
	// the filter return an array containing all the
	// incorrect UI. Sowindow if it's not empty, there's a
	// problem
	if (!params.uiAllowed && params.uiAllowed.filter(uiFilter).length > 0) {
		this.sendStatusError('Incorrect UIs. What\'da hell are you doing??');
		return false;
	}
	return true;
};

/**
 * _start
 * Method to start the instance.
 * Find an ID and color, and set up all the shite.
 * 
 * @param  {object}  params Param from the `connect` event
 */
RemoteSocket.prototype._start = function (params) {
	// Store the window object
	this.id = this.collection.add(this);
	this.color = this.generateUniqueColor();
	this.uiAllowed = params.uiAllowed;
	this.windowId = this.window.id;
	
	this.socket.card = this;

	// Give connection details to the remote
	this.sendStatusSuccess({
		remoteId: this.id,
		color: this.color
	});
	this.window.addRemote(this);
};


/**
 * Internal methods
 **********************************************************
 */

/**
 * generateColor
 * generate a random hexadecimal color, based
 * on a small scale. No grayscale.
 *
 * 3^3 - 3 => 24 colors
 *
 * @return {[string]}        The color
 */
RemoteSocket.prototype.generateColor = function () {
	var r, g, b, hexs = ['5', '9', 'd', 'd'];
	do {
		r = hexs[Math.floor(Math.random() * 3)];
		g = hexs[Math.floor(Math.random() * 3)];
		b = hexs[Math.floor(Math.random() * 3)];
	} while (r === g && r === b);

	return r + r + g + g + b + b;
};

/**
 * generateUniqueColor
 * generate a unique color for a new remote
 * on a window. The method accept a `window`
 * object as parameter, which will be used to
 * find an un-used color.
 *
 * @return {[string]}        The color
 */
RemoteSocket.prototype.generateUniqueColor = function () {
	var i, color, colorsInUse = [];
	for (i in this.window.remotes) {
		colorsInUse.push(this.window.remotes[i].color);
	}
	do {
		color = this.generateColor();
	} while (colorsInUse.indexOf(color) !== -1);
	return color;
};

// Export
module.exports = RemoteSocket;