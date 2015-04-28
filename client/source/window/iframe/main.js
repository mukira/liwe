/* global SockJS */

/**
 * iframe wrapper
 * this will be the communicator on webapp side
 * the iframe might be used as a sandbox to
 * can parse any bad commands and take care of
 * the socket.
 * Coz' we love sockets.
 *
 */

(function (window) {
  'use strict';

  /**
   * Var definition
   **********************************************
   */
  var socket, connectionTimer, authKey, authKeyPattern, debug;

  /**
   * Init
   **********************************************
   */

  // RegExp for auth key
  authKeyPattern = new RegExp('^[a-zA-Z0-9]{24}');

  // Set up a timeout error for onconnect
  connectionTimer = setTimeout(function () {
    sendLocalMessage('error', {
      error_id: 1,
      error_label: 'Cannot establish socket connection to the server'
    });
  }, 15000);

  debug = function () {
    if (false) {
      console.log.apply(console, arguments);
    }
  };

  /**
   * Socket part
   **********************************************
   */

  // Start the socket
  socket = new SockJS('/stream');

  // Set up events
  socket.onopen = function () {
    sendLocalMessage('ready');
    if (typeof connectionTimer === 'number') {
      clearInterval(connectionTimer);
      connectionTimer = null;
    }
  };
  socket.onerror = function (e) {
    sendLocalMessage('error', {
      error_id: 0,
      error_label: e.message
    });
  };
  socket.onmessage = function (e) {
    //# Please check this data, we can't be laxists. Where is Sven?
    debug('W     F <<< S', e.data);
    sendMessage(e.data);
  };

  /**
   * X-Frame communication part
   **********************************************
   */

  /**
   * receiveMessage
   * Listener methed to get messages from the parent window
   *
   * @param  {Event} event Event form... well fuck that shite, it's obvious
   */
  function receiveMessage (event) {
    debug('W >>> F     S', event.data);
    if (!authKey) {
      var pkg = JSON.parse(event.data);
      authKey = pkg.data && pkg.data.localKey;
      pkg.data.type = 'w';
      pkg.data.domain = document.referrer;
      debug('W     F >>> S', pkg);
      socket.send(JSON.stringify(pkg));
    }
    else {
      if (event.data.substr(0,24) === authKey) {
        debug('W     F >>> S', event.data.substr(24));
        socket.send(event.data.substr(24));
      }
      else {
        sendLocalMessage('error', {
          error_id: 2,
          error_label: 'WARNING: A script try to use the socket'
        });
      }
    }
  }

  /**
   * sendMessage
   * Gateway method to send message to the parent window
   *
   * @param  {string} rawData Data to send
   */
  function sendMessage (data) {
    debug('W <<< F     S', data);
    window.parent.postMessage(data, '*');
  }

  /**
   * Send event to the parent window
   *
   * @param  {string} command Command name
   * @param  {object} data Object to send
   */
  function sendLocalMessage (command, data) {
    sendMessage(JSON.stringify({
      command:'local_gateway',
      data: {
        type: command,
        data: data
      }
    }));
  }
  window.addEventListener('message', receiveMessage, false);

})(window);
