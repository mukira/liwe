'use strict';

angular.module('enginePkg')

  /**
   * @ngdoc function
   * @name enginePkg.browser
   * @function browser
   * @required $window
   * @required $document
   *
   * @description
   * Layer of tools about the browser and the window itself.
   * Manage to get informations about the services available
   * from the browser (websocket, accelerometer...). But also
   * information about the URL, to get the Window ID.
   * 
   * @return {object} Service API
   */
  .factory('browser', ['$window', '$document', function ($window, $document) {
    var docDom = $document[0];

    return {
      /**
       * @ngdoc property
       * @name browser#isIOS
       * @propertyOf enginePkg.browser
       * @description
       * Boolean to check if the platform is iOS
       *
       */
      isIOS: /(iPad|iPod|iPhone)/g.test(navigator.userAgent),

      /**
       * @ngdoc method
       * @name browser#init
       * @methodOf enginePkg.browser
       * @description
       * Initialise the window.
       * Must be called only once, at the start.
       * It try to scroll to the maximum top to make
       * the app as big as possible.
       *
       */
      init: function(){
        $window.scrollTo(1,0);
        $window.addEventListener('resize',function(){
          $window.scrollTo(1,0);
        });
      },

      /**
       * @ngdoc method
       * @name browser#getWindowId
       * @methodOf enginePkg.browser
       * @description
       * Get the window ID of the page
       * from the URL
       * 
       * @return {string} The window ID (or false if incorrect)
       */
      getWindowId: function(){
        if (!docDom || !docDom.baseURI) {
          return null;
        }
        var id = docDom.baseURI.split('/').pop().toLowerCase();
        var pattern = new RegExp('^[b-df-hj-np-tv-z]{6,8}$');
        return (pattern.test(id)) ? id : null;
      },

      /**
       * @ngdoc method
       * @name browser#getWindowId
       * @methodOf enginePkg.browser
       * @description
       * Get properties about visibility change
       * on the current browser. Each browser got different
       * properties and event name about visibility change.
       * This is why, this method return an object giving
       * the properties to use:
       *
       * - `status` {string} Window property defining if the window is hidden
       * - `visibilityChange` {string} Event name triggering if the window change visibility
       * 
       * @return {object}
       */
      getVisibilityChangeProperties: function () {
        var hidden, visibilityChange;
        if (typeof docDom.hidden !== 'undefined') {
          hidden = 'hidden';
          visibilityChange = 'visibilitychange';
        } else if (typeof docDom.mozHidden !== 'undefined') {
          hidden = 'mozHidden';
          visibilityChange = 'mozvisibilitychange';
        } else if (typeof docDom.msHidden !== 'undefined') {
          hidden = 'msHidden';
          visibilityChange = 'msvisibilitychange';
        } else if (typeof docDom.webkitHidden !== 'undefined') {
          hidden = 'webkitHidden';
          visibilityChange = 'webkitvisibilitychange';
        } else {
          return false;
        }
        return {
          status: hidden,
          eventName: visibilityChange
        };
      },

      /**
       * @ngdoc method
       * @name browser#gotWebsocket
       * @methodOf enginePkg.browser
       * @description
       * Check if the browser is compatible with websockets
       * 
       * @return {boolean}
       */
      gotWebsocket: function() {
        return !!$window.WebSocket;
      },

      /**
       * @ngdoc method
       * @name browser#gotAccelerometer
       * @methodOf enginePkg.browser
       * @description
       * Check if the accelerometer is available
       * 
       * @return boolean
       */
      gotAccelerometer: function() {
        return true || !!$window.ondevicemotion;
      },

      /**
       * @ngdoc method
       * @name browser#gotCompass
       * @methodOf enginePkg.browser
       * @description
       * Check if the compass is available
       * 
       * @return boolean
       */
      gotCompass: function() {
        //# find better test
        return true || !!$window.ondeviceorientation;
      },

      /**
       * @ngdoc method
       * @name browser#gotTouchEvent
       * @methodOf enginePkg.browser
       * @description
       * Check if the compass is available
       * 
       * @return boolean
       */
      gotTouchEvent: function() {
        return !!$window.TouchEvent;
      },

      /**
       * @ngdoc method
       * @name browser#gotVibrate
       * @methodOf enginePkg.browser
       * @description
       * Check if the vibrate is available
       * 
       * @return boolean
       */
      gotVibrate: function() {
        return !!$window.navigator && !!$window.navigator.vibrate;
      }
    };
  }]);
