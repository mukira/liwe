'use strict';

/**
 * @ngdoc service
 * @name  uiButtonPkg
 *
 * @description
 * Button interface
 * 
 */
angular.module('uiButtonPkg', [])

  /**
   * @ngdoc function
   * @name uiButtonPkg.controller:uiButtonCtrl
   * @required $scope
   * @required $document
   *
   * @description
   * controller for the button ui
   * 
   */
  .controller('uiButtonCtrl', ['$scope', '$document', 'socketService', function ($scope, $document, socket) {

    // Variables
    var counter = 0;
    var button = $document[0].getElementById('uiButton');
    var streamScript = function (e) {
      var newStatus = (e.type === 'mousedown' || e.type === 'touchstart') ? 'press' : 'release';
      if (newStatus === $scope.status) {
        return;
      }
      $scope.status = newStatus;
      
      socket.emit('stream', {
        ui: 'button',
        data: {
          id: counter,
          type: $scope.status
        }
      });

      $scope.$digest();
      counter++;
    };

    // Listen click event
    button.addEventListener('touchstart', streamScript);
    button.addEventListener('touchend', streamScript);

    // Itin the shite
    $scope.status = 'release';
  }]);
