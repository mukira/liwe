'use strict';

angular.module('socketPkg')

  /**
   * @ngdoc function
   * @name socketPkg.remoteSocketService
   * @function remoteSocketService
   * @required $q
   * @required $timeout
   * @required $document
   * @required $window
   * 
   * @description
   * Wrapper for the socket connection, to provide
   * an API in match with the needs of the app.
   *
   * The API returned is as simple as possible: `connect`,
   * `disconnect` (+ `onDisconnect`), and `stream`.
   *
   * @return {object} Service API
   */
  .factory('remoteSocketService', [
    '$q',
    '$timeout',
    '$document',
    '$window',
    'socketService',
    'uiListAvailable',
    'browser',
    function ($q, $timeout, $document, $window, socket, uiListAvailable, browser) {

      var api,
        connectionTimeout,
        connectDeferred,
        disconnectDeferred,
        docDom;

      docDom = $document[0];
      api = {
        /**
         * @ngdoc method
         * @name remoteSocketService#connect
         * @methodOf socketPkg.remoteSocketService
         * @description
         * Start the auth protocol, and return a promise once
         * connected with the data of the connect event.
         *
         * @return {promise} Connection promise
         */
        connect: function () {
          // Check if the connection has been started before
          if (connectDeferred) {
            return connectDeferred.promise;
          }

          // Build object and timeout
          connectDeferred = $q.defer();
          connectionTimeout = $timeout(function () {
            connectDeferred.reject('Connection has failed.');
          }, 20000);

          // Check the windowID
          if (!browser.getWindowId()) {
            connectDeferred.reject('It seems to have a problem with the URL.');
          }

          // Listen the status
          socket.on('status', function (data) {
            if (!!data.isConnected) {
              $timeout.cancel(connectionTimeout);
              socket.info = data;
              connectDeferred.resolve(data);
            }
            else {
              connectDeferred.reject(data.label);
            }
          });

          // Start the connection
          socket.initCallback(function () {
            socket.emit('connect', {
              type: 'r',
              windowId: browser.getWindowId(),
              uiAllowed: uiListAvailable
            });
          });

          return connectDeferred.promise;
        },

        /**
         * @ngdoc method
         * @name remoteSocketService#stream
         * @methodOf socketPkg.remoteSocketService
         * @description
         * Simple wrapper to stream data to the server
         * 
         * @param  {object} data Data to stream
         */
        stream: function(data){
          socket.emit('stream', data);
        },

        /**
         * @ngdoc method
         * @name remoteSocketService#disconnect
         * @methodOf socketPkg.remoteSocketService
         * @description
         * Method to send a disconnect signal
         *
         * @return {promise} Disconnection promise
         */
        disconnect: function () {
          socket.emit('disconnect', {
            message: 'Sorry, you were away, I felt alone, so I hang up',
            wasSuccess: false
          });
          return api.onDisconnect();
        },

        /**
         * @ngdoc method
         * @name remoteSocketService#onDisconnect
         * @methodOf socketPkg.remoteSocketService
         * @description
         * Return the pronise in case of disconnection
         * WARNING, the promise is calling a resolved
         * if the disconnect was a success. If not
         * it will be a reject.
         * 
         * @return {promise} Disconnection promise
         */
        onDisconnect: function () {
          // Check if the connection has been started before
          if (disconnectDeferred) {
            return disconnectDeferred.promise;
          }

          // Build object and timeout
          disconnectDeferred = $q.defer();
          socket.on('disconnect', function (data) {
            if (!!data.wasSuccess) {
              disconnectDeferred.resolve(data.message);
            }
            else {
              disconnectDeferred.reject(data.message);
            }
          });

          // Experimental lose focus to disconnect
          var vcProperties = browser.getVisibilityChangeProperties();
          if (vcProperties) {
            docDom.addEventListener(vcProperties.eventName, function() {
              if (docDom[vcProperties.status]) {
                api.disconnect();
              }
            }, false);
          }
          $window.addEventListener('pagehide', function() {
            api.disconnect();
          }, false);

          return disconnectDeferred.promise;
        }
      };
      return api;
    }
  ]);