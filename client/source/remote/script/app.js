'use strict';

/**
 * @ngdoc service
 * @name  remoteApp
 *
 * @description
 * THE app, where the magic begins
 * 
 */
angular.module('remoteApp', ['ngAnimate', 'directivesPkg', 'enginePkg', 'socketPkg', 'uiPkg'])

  /**
   * @ngdoc function
   * @name remoteApp.controller:appCtrl
   *
   * @description
   * App controller, initiate the factories and start
   * the connection.
   * 
   */
  .controller('appCtrl', [
    'remoteSocketService',
    'browser',
    'promptrService',
    'colorIdService',
    function (remoteSocket, browser, promptr, colorId) {
      // Initialise the browser
      browser.init();

      // Connection
      remoteSocket
        .connect()
        .then(function (status) {
          colorId.set(status.color);
        },
        function (errorMsg) {
          promptr.finish(errorMsg, false);
        });

      // Disconnect
      remoteSocket
        .onDisconnect()
        .then(function (successMsg) {
          promptr.finish(successMsg, true);
        },
        function (errorMsg) {
          promptr.finish(errorMsg, false);
        });
    }
  ]);

/**
 * Define other modules
 * 
 ************************************************
 */

/**
 * @ngdoc service
 * @name  directivesPkg
 *
 * @description
 * Package containing all common directives
 * 
 */
angular.module('directivesPkg', []);

/**
 * @ngdoc service
 * @name  enginePkg
 *
 * @description
 * Package containing all core module of the app.
 * Refering to the browser, connection status...
 * 
 */
angular.module('enginePkg', []);

/**
 * @ngdoc service
 * @name  socketPkg
 *
 * @description
 * Package containing elements for the socket
 * connection and wrapper for the app needs
 * 
 */
angular.module('socketPkg', []);