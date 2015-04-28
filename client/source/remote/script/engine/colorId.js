'use strict';

angular.module('enginePkg')

  /**
   * @ngdoc function
   * @name enginePkg.colorIdService
   * @function colorIdService
   * @required $q
   *
   * @description
   * Manager for the color service
   * 
   * @return {object} Service API
   */
  .factory('colorIdService', ['$q', function ($q) {
    var connectedDefer = $q.defer();
    var api = {
      /**
       * @ngdoc property
       * @name colorIdService#promise
       * @methodOf enginePkg.colorIdService
       * @description
       * Promise resolved when the color is set. 
       *
       * @return {promise}
       */
      promise: connectedDefer.promise,

      /**
       * @ngdoc method
       * @name colorIdService#set
       * @methodOf enginePkg.colorIdService
       * @description
       * Set the Remote color ID which will be displayed
       *
       * @param {string} color Remote color ID
       */
      set: function (color) {
        connectedDefer.resolve(color);
      }
    };
    return api;
  }])

  /**
   * @ngdoc directive
   * @name enginePkg.directive:colorId
   * @restrict A
   * @element ANY
   * @scope false
   *
   * @description
   * Directive to set up and display the
   * remote color. This directive get the promise
   * from the colorIdService to trigger the
   * animation on the UI.
   *
   */
  .directive('colorId', ['colorIdService', function (colorId) {
    // Update the status once the color received
    return {
      restrict: 'A',
      link: function (scope, element) {
        colorId.promise.then(function (color) {
          element
            .css('background-color', '#' + color)
            .addClass('ready');
        });
      }
    };
  }]);