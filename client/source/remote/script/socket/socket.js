'use strict';

/**
 * We define a factory the socket service is instantiated only once, and
 * thus act as a singleton for the scope of the application
 * 
 */
angular.module('socketPkg')

  /**
   * @ngdoc function
   * @name socketPkg.socketService
   * @function socketService
   * @required $window
   *
   * @description
   * Wrapper for SockJS.
   * Include an event manager, a wrapper to emit messages
   * to the server (and receive them).
   *
   * Once the factory injected, SockJS connection has
   * been started. But this is just the connection,
   * not the authentication.
   * 
   * @return {object} Service API
   */
  .factory('socketService', ['$window', function ($window) {
    var socket = new SockJS('/stream');
    var events = {};
    var socketService = {
      status: {
        isConnected: false,
        statusName: 'connecting'
      }
    };

    // Set up events
    socket.onopen = function () {
      socketService.status.isConnected = true;
      socketService.status.statusName = 'connected';
      if (!!socketService.firstConnectCallback) {
        socketService.firstConnectCallback();
      }
    };
    socket.onerror = function () {
      console.log('bye');
      socketService.status.isConnected = false;
      socketService.status.statusName = 'disconnected';
    };
    socket.onmessage = function (e) {
      var callbackList, callback;
      e.data = JSON.parse(e.data);
      console.log('R <<< S', e.data);
      if (!!e.data.command && events[e.data.command]) {
        callbackList = events[e.data.command];
        for (var i in callbackList) {
          callback = callbackList[i];
          callback(e.data.data);
        }
      }
    };


    // SocketService interface
    
    /**
     * @ngdoc method
     * @name socketService#on
     * @methodOf socketPkg.socketService
     * @description
     * Listen on a command event. Many listeners can be
     * set up for the same command. But at the moment
     * there's no way to remove a listener.
     *
     * @param {string} command Command name to listen
     * @param {function} callback Event listener to setup
     */
    socketService.on = function (command, callback) {
      if (!events[command]) {
        events[command] = [];
      }
      events[command].push(callback);
    };

    /**
     * @ngdoc method
     * @name socketService#emit
     * @methodOf socketPkg.socketService
     * @description
     * Send a command event to the server.
     * Wrap the command and data to push it.
     * The data object will be stringified, so be careful
     * about un-enumerable properties. 
     *
     * @param {string} command Command name to listen
     * @param {function} callback Event listener to setup
     */
    socketService.emit = function (command, data) {
      console.log('R >>> S', {
        remoteId: socketService.info && socketService.info.remoteId,
        command: command,
        data: data
      });
      socket.send(JSON.stringify({
        remoteId: socketService.info && socketService.info.remoteId,
        command: command,
        data: data
      }));
    };

    /**
     * @ngdoc method
     * @name socketService#initCallback
     * @methodOf socketPkg.socketService
     * @description
     * Callback for the connection to the server.
     * This can be called later after the connection,
     * but only one callback can be attributed to be called.
     *
     * @param {function} callback Event listener to setup
     */
    socketService.initCallback = function (callback) {
      if (!!socketService.status.isConnected) {
        callback();
      }
      else {
        socketService.firstConnectCallback = callback;
      }
    };

    /**
     * @ngdoc method
     * @name socketService#disconnect
     * @methodOf socketPkg.socketService
     * @description
     * Disconnect the socket.
     *
     */
    socketService.disconnect = function () {
      socket.close();
    };
    return socketService;
  }]);
