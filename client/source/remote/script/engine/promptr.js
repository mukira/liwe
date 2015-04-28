'use strict';

angular.module('enginePkg')

  /**
   * @ngdoc function
   * @name enginePkg.promptrService
   * @function promptrService
   * @required $timeout
   *
   * @description
   * Content manager of the promptr.
   * This factory can be injected anywhere else and will
   * allow to control the promptr.
   * 
   * @return {object} Service API
   */
  .factory('promptrService', ['$timeout', function ($timeout) {
    var timer;
    var status = {
      text: 'Hello Buddy!',
      size: 'closed'
      // endText (string)
      // endType (string)
      // isFinished (boolean)
    };
    var promptr = {
      /**
       * @ngdoc property
       * @name promptrService#status
       * @methodOf enginePkg.promptrService
       * @description
       * Object defining the current status of the promptr.
       * It contain 5 properties:
       *
       * - `text`       {string}   Text displayed on the promptr
       * - `size`       {string}   Closed or visible ('closed' or 'standard')
       * - `endText`    {string}   Text for the promptr closure
       * - `endType`    {string}   Type of disconnection ('success' or 'fail')
       * - `isFinished` {boolean}  Is the connection finished?
       *
       * @return {object}
       */
      status: status,

      /**
       * @ngdoc method
       * @name promptrService#show
       * @methodOf enginePkg.promptrService
       * @description
       * Set the promptr class to popup and be visible,
       * with the text and duration wanted.
       *
       * The text will always be parsed by Angular to prevent
       * any XSS injection or other shite (thanks Angular)
       *
       * The duration is in ms. After this duration, the
       * promptr will come back to hidden.
       *
       * @param {string} text Text to display
       * @param {number} duration Time before hiding the promptr (in ms)
       */
      show: function (text, duration) {
        status.size = 'standard';
        status.text = text.substr(0, 60);
        if (duration) {
          promptr.hideIn(duration);
        }
      },

      /**
       * @ngdoc method
       * @name promptrService#hide
       * @methodOf enginePkg.promptrService
       * @description
       * Hide the promptr.
       * If any timeout was set to hide the promptr
       * (from `show`), it will be cancelled.
       * 
       */
      hide: function () {
        status.size = 'closed';
        promptr.cancelTimer();
      },

      /**
       * @ngdoc method
       * @name promptrService#trigger
       * @methodOf enginePkg.promptrService
       * @description
       * Popup the promptr if it's hidden or the opposite if
       * it's visible.
       * 
       */
      trigger: function () {
        if (!status.isFinished) {
          status.size = status.size === 'closed' ? 'standard' : 'closed';
        }
      },

      /**
       * @ngdoc method
       * @name promptrService#hideIn
       * @methodOf enginePkg.promptrService
       * @description
       * Set the timer to hide the promptr in the duration
       * given in parameter.
       *
       * @param {number} delay Time before hiding the promptr (in ms)
       */
      hideIn: function (delay) {
        promptr.cancelTimer();
        timer = $timeout(promptr.hide, delay);
      },

      /**
       * @ngdoc method
       * @name promptrService#cancelTimer
       * @methodOf enginePkg.promptrService
       * @description
       * Cancel the current timer.
       * 
       */
      cancelTimer: function () {
        if (!!timer) {
          $timeout.cancel(timer);
          timer = null;
        }
      },

      /**
       * @ngdoc method
       * @name promptrService#finish
       * @methodOf enginePkg.promptrService
       * @description
       * Method to declare the end of the user experience, and
       * show the final promptr, with the text desired.
       *
       * @param {text} text Final message to display
       * @param {boolean} wasSuccess Marker to define if the session was a success
       *
       */
      finish: function (text, wasSuccess) {
        if (!status.isFinished) {
          status.size = 'hidden';
          status.isFinished = true;
          status.endText = text;
          status.endType = (wasSuccess === undefined || wasSuccess) ? 'success' : 'fail';
        }
      }
    };
    return promptr;
  }])

  /**
   * @ngdoc function
   * @name enginePkg.controller:promptCtrl
   * @required $scope
   * @required $element
   *
   * @description
   * promptCtrl
   * Controller for the little notifier at the bottom
   * of the UI. The content is managed by the promptrService.
   *
   * The behaviour of the promptr is simple. it stays at the
   * bottom of the window to display a little help/info about
   * what's happening. This panel can be shown and hidden by a
   * simple press. Once the session over, the promptr will show
   * a fullscreen message to inform the user. No control or action
   * from the user is possible at that point.
   *
   * The controller is only sensitive on touch event.
   * Get the fuck out of my way with your mouse.
   */
  .controller('promptrCtrl', ['$scope', '$element', 'promptrService', function ($scope, $element, promptrService) {
    var pressed,
      preTrigger = function () {
        pressed = true;
      },
      trigger = function () {
        if (!pressed) {
          return;
        }
        pressed = false;
        promptrService.trigger();
        $scope.$digest();
      };

    // Listen events
    $element.on('touchstart', preTrigger);
    $element.on('touchend', trigger);

    // Keep the status
    $scope.status = promptrService.status;
  }]);