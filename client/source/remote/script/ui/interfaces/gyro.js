'use strict';

/**
 * @ngdoc service
 * @name  uiGyroPkg
 *
 * @description
 * Gyro interface
 * 
 */
angular.module('uiGyroPkg', [])

  /**
   * @ngdoc function
   * @name uiGyroPkg.controller:uiGyroCtrl
   * @required $scope
   * @required $interval
   *
   * @description
   * controller for the gyro UI
   * 
   */
  .controller('uiGyroCtrl', ['$scope', '$interval', 'uiGyroService', 'socketService', function ($scope, $interval, uiGyroService, socket) {
    // Variables and config
    var gyroLoop = $interval(function () {
      socket.emit('stream', {
        ui: 'gyro',
        data: uiGyroService.getCoordinates()
      });
    }, 50);

    // Prepair the stop of the event
    $scope.$on('$destroy', function () {
      $interval.cancel(gyroLoop);
      uiGyroService.stop();
    });

    // Starts the Gyro service
    uiGyroService.start();
  }])

  /**
   * @ngdoc function
   * @name uiGyroPkg.uiGyroService
   * @function uiGyroService
   * @required $window
   *
   * @description
   * 
   * uiGyroService
   * Factory to get the gyro/compass data.
   * The API returned is made to control the listeners
   * and get the data.
   * 
   * @return {object} Service API
   */
  .factory('uiGyroService', ['$window', 'browser', function($window, browser) {
    var data, callbackDeviceMotion, callbackDeviceOrientation, api;
    // Data object
    data = {
      id: 0
    };

    /**
     * Callback for 'devicemotion' events
     * @param  {EventObject} event Event object
     */
    callbackDeviceMotion = function(event) {
      data.x = Math.round(Math.abs(event.accelerationIncludingGravity.x * 1));
      data.y = Math.round(Math.abs(event.accelerationIncludingGravity.y * 1));
      data.z = Math.round(Math.abs(event.accelerationIncludingGravity.z * 1));     
    };

    /**
     * Callback for 'deviceorientation' events
     * This little trick is to fix gyroscope value from
     * Safari mobile. The output must respect the
     * conventions from MDN:
     * alpha:    0 ~ 360
     * beta : -180 ~ 180
     * gamma:  -90 ~ 90
     * 
     * @param  {EventObject} event Event object
     */
    callbackDeviceOrientation = browser.isIOS ? function(event) {
      data.alpha = Math.round(event.alpha);
      data.beta = Math.round(event.beta * 2);
      data.gamma = Math.round(event.gamma / 2);
    } : function(event) {
      data.alpha = Math.round(event.alpha);
      data.beta = Math.round(event.beta);
      data.gamma = Math.round(event.gamma);
    };

    // Service API
    api = {
      /**
       * @ngdoc property
       * @name uiGyroService#isRunning
       * @methodOf uiGyroPkg.uiGyroService
       * @description
       * Marker to know if the service is currently running
       */
      isRunning: false,
      /**
       * @ngdoc property
       * @name uiGyroService#data
       * @methodOf uiGyroPkg.uiGyroService
       * @description
       * Current data event data object.
       */
      data: data,
      /**
       * @ngdoc method
       * @name uiGyroService#start
       * @methodOf uiGyroPkg.uiGyroService
       * @description
       * Start the service (init listeners).
       * Not action will executed if the service is already running.
       */
      start: function () {
        if (api.isRunning) {
          return false;
        }
        api.isRunning = true;
        $window.addEventListener('devicemotion', callbackDeviceMotion);
        $window.addEventListener('deviceorientation', callbackDeviceOrientation);
      },
      /**
       * @ngdoc property
       * @name uiGyroService#getCoordinates
       * @methodOf uiGyroPkg.uiGyroService
       * @description
       * Get event data object, ready to be sent.
       *
       * @return {object} Event data object
       */
      getCoordinates: function () {
        data.id++;
        return data;
      },
      /**
       * @ngdoc property
       * @name uiGyroService#stop
       * @methodOf uiGyroPkg.uiGyroService
       * @description
       * Stops the service and remove listeners.
       */
      stop: function () {
        api.isRunning = false;
        $window.removeEventListener('devicemotion', callbackDeviceMotion);
        $window.removeEventListener('deviceorientation', callbackDeviceOrientation);
      }
    };
    return api;
  }]);