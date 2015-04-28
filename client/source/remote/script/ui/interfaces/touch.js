'use strict';

/**
 * @ngdoc service
 * @name  uiTouchPkg
 *
 * @description 
 * Touch interface
 *
 * In this package, the `TouchList` will be mentionned very often.
 * This type exists, it's the one given from the browser in the 
 * touch event. That's the standard object to get information about
 * finger information.
 * 
 */
angular.module('uiTouchPkg', [])

  /**
   * @ngdoc function
   * @name uiTouchPkg.controller:uiTouchCtrl
   * @required $scope
   * @required $element
   *
   * @description
   * controller for the touch
   *
   * @param  {object} $scope Scope the of the controller
   */
  .controller('uiTouchCtrl', ['$scope', '$element', 'uiTouchListener', 'uiTouchFingerprints', function ($scope, $element, listener, fingerprints) {

    // Give the dots doms to the fingerprints
    var dots = $element[0].querySelectorAll('.point');
    var dotSize = !!dots[0] && !!dots[0].offsetHeight ? dots[0].offsetHeight / 2 : 0;
    fingerprints.setDots(dots, dotSize);

    // Listen touch events
    $element.on('touchstart', listener);
    $element.on('touchmove', listener);
    $element.on('touchend', listener);
    $element.on('touchcancel', listener);
  }])

  /**
   * @ngdoc function
   * @name uiTouchPkg.uiTouchListener
   * @function uiTouchListener
   *
   * @description
   * This service return the listener function used to listen
   * touch events from the UI. It will call `uiTouchFingerprints`
   * to update the fingerprint position on the UI, and call
   * `uiTouchManager` to update the stack.
   *
   * @return {function} Callback event for the touch events
   */
  .factory('uiTouchListener', ['uiTouchManager', 'uiTouchFingerprints', function (manager, fingerprints) {
    return function (e) {
      // Check if the event object is alright
      if (!e || !e.touches) {
        return;
      }

      // Kill the propagation
      e.preventDefault();

      // Let's continue in a try..catch, in case crash
      try {
        // Check what to do
        switch (e.type) {
        case 'touchmove':
          // In any case: update
          manager.updateEvent(e.touches);
          fingerprints.updatePos(e.touches);
          break;

        case 'touchstart':
          // add this new finger to the list
          manager.aFingerHasJoined(e.touches);
          fingerprints.update(e.touches);
          break;

        case 'touchend':
          // case 'touchcancel':
          // Remove the finger from the list
          manager.aFingerHasLeft(e.touches);
          fingerprints.update(e.touches);
          break;
        }
      }
      catch (e) {
        // Something bad is happening. Let's hide it and debug it discretly
        console.error('UI.touch', e.toString() + ' -- ' + e.stack);
      }
    };
  }])

  /**
   * @ngdoc function
   * @name uiTouchPkg.uiTouchManager
   * @function uiTouchManager
   *
   * @description
   * This service returns API to manage fingers.
   * These will be treated to update the stack.
   * It's made to recognise fingers and define
   * on which of event we are, like 'move' or 'scale'.
   * Then passes the data to `uiTouchQueue` to update the stack.
   * 
   * @return {object} Service API
   */
  .factory('uiTouchManager', ['uiTouchQueue', function (queue) {
    var currentEvt = '';    // Name of the event in progress
    var touchesOrigin = {}; // Original TouchList object form the event in progress

    /**
     * Method to check if the originals fingers
     * are still present in the new fingers
     * 
     * @param  {TouchList} touchesNew TouchList object from the event data
     * @return {Boolean}              True if the fingers from param are still in
     */
    var isStillInTouch = function (touchesNew) {
      for (var i = 0; i < touchesOrigin.length; i++) {
        if (touchesOrigin[i].identifier !== touchesNew[i].identifier) {
          return false;
        }
      }
      return true;
    };

    var cloneAndTrim = function (touches) {
      var i, output = [];
      for (i = 0; i < touches.length; i++) {
        output.push({
          identifier: touches[i].identifier,
          clientX: touches[i].clientX,
          clientY: touches[i].clientY
        });
      }
      return output;
    };

    var api = {
      /**
       * @ngdoc method
       * @name uiTouchManager#aFingerHasLeft
       * @methodOf uiTouchPkg.uiTouchManager
       * @description
       * Parse TouchList when a finger has left the screen.
       * The method require the TouchList object from the
       * event to process. From the current amount of
       * fingers in the list, it can guess what is the
       * current situation.
       *
       * @param {TouchList} fingers TouchList object from the event data
       */
      aFingerHasLeft: function (fingers) {
        switch (fingers.length) {
        case 0:
          // Remove the finger and stop the move event
          queue.stackMoveEnd();
          touchesOrigin = [];
          currentEvt = '';
          break;
        case 1:
          // Stop the scale event
          // Remove the finger
          // Start the move event
          queue.stackScaleEnd();
          touchesOrigin = cloneAndTrim(fingers);
          currentEvt = 'move';
          queue.stackMoveStart(touchesOrigin);
          break;
        default:
          // Check if the finger missing is one
          // of the list, if so, stop do the necessary
          if (!isStillInTouch(fingers)) {
            queue.stackScaleEnd();
            touchesOrigin = [fingers[0], fingers[1]];
            currentEvt = 'scale';
            queue.stackScaleStart(touchesOrigin);
          }
        }
      },
      /**
       * @ngdoc method
       * @name uiTouchManager#aFingerHasJoined
       * @methodOf uiTouchPkg.uiTouchManager
       * @description
       * Parse TouchList when a finger has joined the screen.
       * The method require the TouchList object from the
       * event to process. From the current amount of
       * fingers in the list, it can guess what is the
       * current situation.
       *
       * @param {TouchList} fingers TouchList object from the event data
       */
      aFingerHasJoined: function (fingers) {
        switch (fingers.length) {
        case 1:
          // Add the finger and start the move event
          touchesOrigin = cloneAndTrim(fingers);
          currentEvt = 'move';
          queue.stackMoveStart(touchesOrigin);
          break;
        case 2:
          // Stop the move event and add the new one
          // then start the scale event
          queue.stackMoveEnd();
          touchesOrigin = cloneAndTrim(fingers);
          currentEvt = 'scale';
          queue.stackScaleStart(touchesOrigin);
          break;
        }
        // We don't care about the others
      },
      /**
       * @ngdoc method
       * @name uiTouchManager#updateEvent
       * @methodOf uiTouchPkg.uiTouchManager
       * @description
       * Parse TouchList when a finger has moved on the screen.
       * The method require the TouchList object from the
       * event to process. From it, it will update the stack.
       *
       * @param {TouchList} fingers TouchList object from the event data
       */
      updateEvent: function (fingers) {
        queue.stackUpdate(touchesOrigin, fingers);
      }
    };
    return api;
  }])

  /**
   * @ngdoc function
   * @name uiTouchPkg.uiTouchQueue
   * @function uiTouchQueue
   *
   * @description
   * This service returns API to store the event in progress.
   * 
   * @return {object} Service API
   */
  .factory('uiTouchQueue', ['uiTouchDigestor', 'uiTouchCalc', function (digestor, calc) {
    var stack = [];    // Current stack of event (the buffer)
    var lastData = {}; // Last data event
    var counter = 0;   // Event ID counter

    /**
     * Wrapper method to push an event object into the stack
     * @param  {string} evtType Event name
     * @param  {string} status  Status name (start, update, end)
     * @param  {object} data    Data object of movement info
     */
    var stacker = function (evtType, status, data) {
      stack.push({
        type: evtType,
        id: counter,
        status: status,
        data: data
      });
      lastData = data;
      // Call the digestor
      if (digestor(stack)) {
        stack = [];
      }
    };

    return {
      /**
       * @ngdoc method
       * @name uiTouchQueue#stackMoveStart
       * @methodOf uiTouchPkg.uiTouchQueue
       * @description
       * Pushes a move-start event object to the stack
       *
       * @param {TouchList} fingers TouchList object from the event data
       */
      stackMoveStart: function (fingers) {
        stacker('move', 'start', {
          origin: {
            x: fingers[0].clientX,
            y: fingers[0].clientY
          }
        });
      },
      /**
       * @ngdoc method
       * @name uiTouchQueue#stackMoveEnd
       * @methodOf uiTouchPkg.uiTouchQueue
       * @description
       * Pushes a move-end event object to the stack
       * 
       */
      stackMoveEnd: function () {
        stacker('move', 'end', lastData);
        counter++;
      },
      /**
       * @ngdoc method
       * @name uiTouchQueue#stackScaleStart
       * @methodOf uiTouchPkg.uiTouchQueue
       * @description
       * Pushes a scale-start event object to the stack
       *
       * @param {TouchList} fingers TouchList object from the event data
       */
      stackScaleStart: function (fingers) {
        stacker('scale', 'start', {
          origin: {
            x: (fingers[0].clientX + fingers[1].clientX) / 2,
            y: (fingers[0].clientY + fingers[1].clientY) / 2
          },
          move: {x: 0, y: 0},
          scale: 1,
          rotation: 0
        });
      },
      /**
       * @ngdoc method
       * @name uiTouchQueue#stackScaleEnd
       * @methodOf uiTouchPkg.uiTouchQueue
       * @description
       * Pushes a scale-end event object to the stack
       * 
       */
      stackScaleEnd: function () {
        stacker('scale', 'end', lastData);
        counter++;
      },
      /**
       * @ngdoc method
       * @name uiTouchQueue#stackUpdate
       * @methodOf uiTouchPkg.uiTouchQueue
       * @description
       * Pushes an update event object to the stack,
       * from the origin and update TouchList.
       *
       * @param {TouchList} fingersOrigin TouchList object from the orginal event data
       * @param {TouchList} fingersUpdate TouchList object from the end event data
       */
      stackUpdate: function (fingersOrigin, fingersUpdate) {
        stacker(fingersOrigin.length === 1 ? 'move' : 'scale', 'update', calc(counter, fingersOrigin, fingersUpdate));
      }
    };
  }])

  /**
   * @ngdoc function
   * @name uiTouchPkg.uiTouchCalc
   * @function uiTouchCalc
   *
   * @description
   * This factory is made to calculate update between touch events.
   * get the finger position before and after to calculate
   * the evolution of the position.
   * 1st, detect the event type : move or scale
   * 2nd, pass the date to the correct function
   *
   * In this factory, the 'Vector' or 'Point' object will be mention.
   * This is not a proper type, this is just a simple object
   * with an 'x' and 'y' attribute.
   * 
   * @return {function} Calculator method
   */
  .factory('uiTouchCalc', [function () {

    var currentEvtId, posOrigin, vectorOrigin;

    /**
     * Calculate the angle of a vector
     * @param  {object} vector Vector object (contain an 'x' and a 'y' attribute)
     * @return {number}        Angle in radians
     */
    var calcAngle = function (vector) {
      if (vector.x >= 0 && vector.y > 0) {
        return Math.acos(vector.y / vector.hypo);
      }
      if (vector.x > 0 && vector.y <= 0) {
        return Math.acos(vector.x / vector.hypo) + 0.5 * Math.PI;
      }
      if (vector.x <= 0 && vector.y < 0) {
        return Math.acos(-vector.y / vector.hypo) + 1 * Math.PI;
      }
      if (vector.x < 0 && vector.y >= 0) {
        return Math.acos(-vector.x / vector.hypo) + 1.5 * Math.PI;
      }
      return 0;
    };

    /**
     * Calculate the center position between the 2 first
     * fingers in a TouchList
     * @param  {TouchList} fingers TouchList of two fingers
     * @return {object}            Point object
     */
    var calcCenterPos = function (fingers) {
      var output = {
        x: (fingers[0].clientX + fingers[1].clientX) / 2,
        y: (fingers[0].clientY + fingers[1].clientY) / 2,
      };
      return output;
    };

    /**
     * Calculate the vector between the 2 first fingers
     * in a TouchList
     * @param  {TouchList} fingers TouchList of two fingers
     * @return {object}            Vector object
     */
    var calcVector = function (fingers) {
      var output = {
        x: fingers[1].clientX - fingers[0].clientX,
        y: fingers[1].clientY - fingers[0].clientY
      };
      output.hypo = Math.sqrt(Math.pow(output.x, 2) + Math.pow(output.y, 2));
      output.angle = calcAngle(output);
      return output;
    };

    /**
     * API to generate data for the simple move
     * Very basic, only one finger to manage
     * @param {TouchList} fingersOrigin TouchList object from the orginal event data
     * @param {TouchList} fingersUpdate TouchList object from the end event data
     * @return {object} Event base object, containing a `move` object
     */
    var apiMove = function (fingersOrigin, fingersUpdate) {
      var x, y;
      if (fingersOrigin[0]) {
        //# Check if this is still valid and comments
        x = fingersUpdate[0].clientX - fingersOrigin[0].clientX;
        y = fingersUpdate[0].clientY - fingersOrigin[0].clientY;
      }
      else {
        x = fingersUpdate.x - fingersOrigin.x;
        y = fingersUpdate.y - fingersOrigin.y;
      }
      return {move: {x: x, y: y}};
    };

    /**
     * API to generate data for the scale event
     * Let's go motherfuckers, there's a lot of calculations to do
     * 1. Get the center point from origin and update
     * 2. Get the scale
     * 3. Find the rotation
     * @param {TouchList} fingersOrigin TouchList object from the orginal event data
     * @param {TouchList} fingersUpdate TouchList object from the end event data
     * @return {object} Complete event data object, containing a `move` object
     */
    var apiScale = function (fingersOrigin, fingersUpdate) {
      posOrigin = posOrigin || calcCenterPos(fingersOrigin);
      vectorOrigin = vectorOrigin || calcVector(fingersOrigin);
      var posUpdate = calcCenterPos(fingersUpdate);
      var vectorUpdate = calcVector(fingersUpdate);

      var output = apiMove(posOrigin, posUpdate);
      output.scale = vectorUpdate.hypo / vectorOrigin.hypo;
      output.rotation = - (vectorUpdate.angle - vectorOrigin.angle);
      return output;
    };

    /**
     * Calculator method returned by the factory, made to generate
     * the touch event data object from the eventID, and TouchLists.
     * @param {integer}   eventId       Event ID
     * @param {TouchList} fingersOrigin TouchList object from the orginal event data
     * @param {TouchList} fingersUpdate TouchList object from the end event data
     * @return {object}   Complete event data object, containing a `move` object
     */
    return function (eventId, fingersOrigin, fingersUpdate) {
      if (currentEvtId !== eventId) {
        currentEvtId = eventId;
        posOrigin = null;
        vectorOrigin = null;
      }
      switch (fingersOrigin.length) {
      case 1:
        return apiMove(fingersOrigin, fingersUpdate);
      case 2:
        return apiScale(fingersOrigin, fingersUpdate);
      default:
        throw new Error('Wut');
      }
    };
  }])

  /**
   * @ngdoc function
   * @name uiTouchPkg.uiTouchDigestor
   * @function uiTouchDigestor
   * @required $timeout
   * 
   * @description
   * interface between the queue and the socket
   * the idea is to not transmit every event update
   * but only the important ones via regular
   * intervals.
   *
   * @return {function} Stack digestor
   */
  .factory('uiTouchDigestor', ['socketService', function (socket) {

    /**
     * Digestor, method returned by the factory to push event
     * data to the stack
     * @param  {array} stack Array of event data object ready to be sent
     * @return {boolean}     True if the data has ben sent (false if putted in cache)
     */
    return function (stack) {
      // Check if the conditions are ok
      if (stack.length === 0) {
        return false;
      }
      
      var evt,
        output = [];
      for (var i = stack.length - 1; i >= 0; i--) {
        evt = stack[i];
        output.unshift({
          ui: 'touch',
          data: evt
        });
      }
      socket.emit('stream', output);
      return true;
    };
  }])

  /**
   * @ngdoc function
   * @name uiTouchPkg.uiTouchFingerprints
   * @function uiTouchFingerprints
   * 
   * @description
   * Manager for dots in the UI
   *
   * @return {object} Service API
   */
  .factory('uiTouchFingerprints', [function () {
    var domDots, domOffset, api;
    domDots = [];
    domOffset = 0;
    api = {
      /**
       * @ngdoc method
       * @name uiTouchFingerprints#setDots
       * @methodOf uiTouchPkg.uiTouchFingerprints
       * @description
       * Define DOM objects as dots, with their offset
       *
       * @param {array} dots Array of DOMobjects (the dots)
       * @param {integer} offset Distance between their origin point and the emulated one
       */
      setDots: function (dots, offset) {
        domDots = dots;
        domOffset = offset;
      },
      /**
       * @ngdoc method
       * @name uiTouchFingerprints#updatePos
       * @methodOf uiTouchPkg.uiTouchFingerprints
       * @description
       * Update the position of fingerprints from TouchList
       * coordinates.
       *
       * @param {TouchList} fingers TouchList object from the orginal event data
       */
      updatePos: function (fingers) {
        var j = 0;
        for (var i = 0; i < fingers.length && !!domDots[j]; i++) {
          domDots[j].style.left = fingers[i].clientX - domOffset;
          domDots[j].style.top  = fingers[i].clientY - domOffset;
          j++;
        }
      },
      /**
       * @ngdoc method
       * @name uiTouchFingerprints#update
       * @methodOf uiTouchPkg.uiTouchFingerprints
       * @description
       * Update fingerprints, not only about positions but,
       * also about which one is active.
       *
       * @param {TouchList} fingers TouchList object from the orginal event data
       */
      update: function (fingers) {
        api.updatePos(fingers);
        var j = 0;
        for (var i = 0; i < fingers.length && !!domDots[j]; i++) {
          domDots[j].classList.add('active');
          j++;
        }
        for(;j < domDots.length; j++) {
          domDots[j].classList.remove('active');
        }
      }
    };
    return api;
  }]);