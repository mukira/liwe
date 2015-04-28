'use strict';

angular.module('directivesPkg')

  /**
   * @ngdoc directive
   * @name directivesPkg.directive:centeredBox
   * @restrict A
   * @element ANY
   * @scope true
   * @required $window
   *
   * @description
   * Directive to set a ratio size on a DOM element, with
   * a margin if necessary. So the parent object must have
   * width and height defined. Of course, the directive
   * listen the window resize to readapt the size of the
   * DOM element.
   *
   * The margin is defined in percentage.
   *
   */
  .directive('centeredBox', ['$window', function($window) {
    var rePosition = function(element, parentElement, ratio, margin) {

      // Get main variables
      var eWidth, eHeight,
        pWidth = parentElement[0].offsetWidth,
        pHeight = parentElement[0].offsetHeight;

      // Calculate ratio
      if (pWidth/pHeight > ratio) {
        // take height
        eHeight = pHeight * (1 - (margin / 100));
        eWidth = eHeight * ratio;
      }
      else {
        eWidth = pWidth * (1 - (margin / 100));
        eHeight = eWidth / ratio;
      }

      // Set the style
      element.css({
        width: Math.round(eHeight),
        height: Math.round(eWidth),
        top: Math.round((pHeight - eHeight) / 2),
        left: Math.round((pWidth - eWidth) / 2)
      });
    };
    return {
      restrict: 'A',
      scope: {
        ratio: '@',
        margin: '@'
      },
      link: function(scope, element, attrs) {
        // Get the parant
        var parentElement, listener;
        parentElement = angular.element(element.parent());
        listener = function(){
          rePosition(element, parentElement, scope.ratio, scope.margin);
        };

        // Set the minimum CSS
        parentElement.css({
          position: 'relative'
        });
        element.css({
          position: 'absolute'
        });

        // Set the repositioning
        listener();
        $window.addEventListener('resize', listener);

        // Stop listening
        scope.$on('$destroy', function () {
          $window.removeEventListener('resize', listener);
        });
      }
    };
  }])

  /**
   * @ngdoc directive
   * @name directivesPkg.directive:dynamicScale
   * @restrict A
   * @element ANY
   * @scope true
   * @required $window
   *
   * @description
   * Directive to make a DOM element take all the free space
   * available. 
   *
   * In the body, which is `height: 100%`, there's two divs.
   * One with a fixed height of 30px (but may vary during the
   * user journey), and you would like the next div to take all
   * the free space available. Well, just set `dynamic-scale`
   * on your div to resize it automatically.
   *
   * This is still in beta, not tested, and not reliable.
   * And don't kill the listener after use.
   *
   */
  .directive('dynamicScale', ['$window', function($window){
    var reSize = function(element, parent, siblings){
      var eHeight = parent[0].offsetHeight;

      for(var i in siblings) {
        eHeight -= siblings[i].offsetHeight;
      }

      element.css({
        height: eHeight
      });
    };
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        
        var parent = angular.element(element.parent());
        var siblings = angular.element(parent.children());
        var siblingsToWatch = [];

        for(var i = 0; i < siblings.length; i++) {
          if(!siblings[i].attributes.getNamedItem('dynamic-scale')){
            siblingsToWatch.push(siblings[i]);
          }
        }

        // Set the resizing
        reSize(element, parent, siblingsToWatch);
        $window.addEventListener('resize',function(){
          reSize(element, parent, siblingsToWatch);
        });
      }
    };
  }]);