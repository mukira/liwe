'use strict';


/**
 * SocketModel class
 * basic and original base of socket object
 * got the basic methods. Mainly to reply
 * and wrap responses.
 */
function SocketModel () {}

/**
 * SendRaw
 * Wrapper method to send pura data
 * @param  {string} data    Message to send
 */
SocketModel.prototype.sendRaw = function (data) {
	return this.socket && this.socket.write(data);
};

/**
 * Send
 * General wrapper for responses and send it
 * @param  {string} command [request command name]
 * @param  {object} data    [data oject]
 * @return {object}         [reponse object]
 */
SocketModel.prototype.send = function (command, data, base) {
	base = base || {};
	base.command = command;
	base.data = data || base.data || {};
	return this.socket && this.socket.write(JSON.stringify(base));
};

/**
 * sendError
 * generate and send reponse data for a status error
 * @param  {string} label [error label]
 * @return {object}       [response object]
 */
SocketModel.prototype.sendError = function (command, label) {
	return this.send('error', {
		command: command,
		label: label
	});
};

/**
 * sendStatusSuccess
 * generate and send reponse data for a status success
 * @param  {object} data [data to send]
 * @return {object}      [response object]
 */
SocketModel.prototype.sendStatusSuccess = function (data) {
	data.isConnected = true;
	return this.send('status', data);
};

/**
 * sendStatusError
 * generate and send reponse data for a status error
 * @param  {string} label [error label]
 * @return {object}       [response object]
 */
SocketModel.prototype.sendStatusError = function (label) {
	return this.send('status', {
		isConnected: false,
		label: label
	});
};

/**
 * close
 * close a socket and nothing else
 * it won't send a message to prevent or any
 * other signal. it just close the connection.
 * @param  {integer} code   [error label]
 * @param  {string}  reason [description]'
 * @return {object}         [response object]
 */
SocketModel.prototype.close = function (code, reason) {
	return this.socket.close();
};

// Export
module.exports = SocketModel;