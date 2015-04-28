'use strict';

/**
 * @ngdoc service
 * @name  uiPkg
 *
 * @description
 * Wrapping all UI components
 * Group them, put a name, include it
 * 
 */
angular.module('uiPkg', ['uiGyroPkg', 'uiButtonPkg', 'uiTouchPkg'])

  /**
   * @ngdoc function
   * @name uiPkg.controller:uiMainCtrl
   * @required $scope
   *
   * @description
   * Main controller of the UI
   * 
   */
  .controller('uiCtrl', ['$scope', 'uiSwitcher', function($scope, uiSwitcher){
    // Set up the UI switcher in the scope
    $scope.uiSwitcher = uiSwitcher;
  }])

  /**
   * @ngdoc function
   * @name uiPkg.uiSwitcher
   * @function uiSwitcher
   * @required $rootScope
   *
   * @description
   * this is made to listen the `set_ui` command
   * and set up the parameters in the local variable to
   * update the controller
   *
   * @return {object} Service API
   */
  .factory('uiSwitcher', ['$rootScope', 'socketService', 'uiList', 'promptrService', function ($rootScope, socket, uiList, promptr) {
    /**
     * Listener for to set up a new UI
     * @param {object} conf Event data (UI config object to set up)
     */
    var setWindowConfig = function(conf) {
      if (!conf.ui || !uiList[conf.ui]) {
        throw 'UI Type unexisting';
      }
      else {
        console.log('new UI >> '+ conf.ui, conf);
        uiModel.uiCtrl = uiList[conf.ui];
        promptr.show(conf.message, 6000);
        $rootScope.$apply();
      }
    };
    socket.on('set_ui', setWindowConfig);

    // API
    var uiModel = {
      /**
       * @ngdoc property
       * @name uiSwitcher#uiCtrl
       * @methodOf uiPkg.uiSwitcher
       * @description
       * Current UI in use
       */
      uiCtrl: uiList['default'],
      /**
       * @ngdoc method
       * @name uiSwitcher#setErrorUI
       * @methodOf uiPkg.uiSwitcher
       * @description
       * Set up the error UI
       */
      setErrorUI: function () {
        setWindowConfig({
          ui: 'error'
        });
      }
    };
    return uiModel;
  }])

  /**
   * @ngdoc function
   * @name uiPkg.uiList
   * @function uiList
   *
   * @description
   * list of the differents UIs
   * Each UI is defined with by:
   * 
   * - `controller` {string}: Controller name
   * - `templateUrl` {string}: URL of the template
   * - `isAvailable` {function}: Compatibility test with running browser 
   *
   * @return {object} UI List
   */
  .factory('uiList', ['browser', function (browser) {
    return {
      default: {
        controller: '',
        templateUrl: 'tpl.ui.default'
      },
      gyro: {
        controller: 'uiGyroCtrl',
        templateUrl: 'tpl.ui.gyro',
        isAvailable: function () {
          return browser.gotAccelerometer() && browser.gotCompass();
        }
      },
      touch: {
        controller: 'uiTouchCtrl',
        templateUrl: 'tpl.ui.touch',
        isAvailable: function () {
          return browser.gotTouchEvent();
        }
      },
      button: {
        controller: 'uiButtonCtrl',
        templateUrl: 'tpl.ui.button',
        isAvailable: function () {
          return true;
        }
      },
      error: {
        controller: '',
        templateUrl: 'tpl.ui.error'
      }
    };
  }])

  /**
   * @ngdoc function
   * @name uiPkg.uiListAvailable
   * @function uiListAvailable
   *
   * @description
   * generate the list of UI available on the device, from
   * the `uiList`. This will return an array of strings,
   * the compatible UIs.
   *
   * @return {array} List of compatible UI
   */
  .factory('uiListAvailable', ['uiList', function (uiList) {
    var output = [];
    for (var uiName in uiList) {
      if (typeof uiList[uiName].isAvailable === 'function' && uiList[uiName].isAvailable()) {
        output.push(uiName);
      }
    }
    return output;
  }]);
