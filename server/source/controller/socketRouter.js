'use strict';

/**
 * SocketRouter
 * this is where we will set alllll the routes
 *
 */

// Modules
var Collection = require('./../model/collection'),
		RemoteSocket = require('./../model/socket/remoteSocket'),
		WindowSocket = require('./../model/socket/windowSocket'),
		config = require('../../../config');

var remoteList = new Collection(),
		windowList = new Collection();

var sockerRouter = {

	/**
	 * Connect protocol
	 * This where everything starts
	 * And there's no way to escape
	 *
	 */
	onOpen: function () {
		// ..have fun
	},

	/**
	 * On Data
	 * Main part of the protocol, all the conversation
	 * is here. So the entire routing is there.
	 * In this context, `this` is the socket
	 */
	onData: function (request) {
		// Set up environment
		var requestObj, command, data, socketObj;
		try {
			requestObj = JSON.parse(request);
			command = requestObj.command;
			data = requestObj.data;
			socketObj = this.card;
		}
		catch (e) {
			return;
		}

		// Test the socket
		if (!socketObj && command !== 'connect') {
			return;
		}

		switch (command) {

		// Data stream
		case 'stream':
			socketObj.stream(request);
			break;

		// Connection case
		case 'connect':
			if (data.type === 'w') {
				new WindowSocket(this, data, windowList);
			}
			else if (data.type === 'r') {
				new RemoteSocket(this, data, remoteList, windowList.get(data.windowId));
			}
			break;

		// Set up new UI
		case 'set_ui':
			socketObj.setUIonRemote(data.remoteId, data.ui, data.message);
			break;

		// Disconnect a remote
		case 'disconnect_remote':
			socketObj.disconnectRemote(data.remoteId, data.message, data.wasSuccess);
			break;

		// Disconnect the connection
		case 'disconnect':
			socketObj.disconnect(data.message, data.wasSuccess);
			break;
		}
	},

	/**
	 * GoodBye
	 * Close connection case, not a lot here
	 * Mainly cleaning
	 *
	 */
	onClose: function () {
		// Let's disconnect if it's not already done
		if (this.card) {
			this.card.disconnect();
		}
	}

};

module.exports = sockerRouter;



/**
 * Interval logger
 * This can be deeply improved, sewously
 * 
 */
if (config && config.log && config.log.statusInterval) {
	setInterval(function () {
		var i, j;

		if (config.log.statusDetailed) {
			console.log('[status][' + (new Date()) + ']');
			for (i in windowList.list) {
				console.log(i + ' [window] (' + windowList.list[i].remotesConnected + ')');
				for (j in windowList.list[i].remotes) {
					console.log('  ' + j + ' [remote]');
				}
			}
			console.log('  [windows: ' + Object.keys(windowList.list).length + '|remotes: ' + Object.keys(remoteList.list).length + ']');
		}
		else {
			console.log('[status][' + (new Date()) + '][windows: ' + Object.keys(windowList.list).length + '|remotes: ' + Object.keys(remoteList.list).length + ']');
		}

	}, config.log.statusInterval * 1000);
}
