'use strict';

// Make a smooth scroll on anchor links
(function() {
    var links = document.querySelectorAll('*[href^="#"]'),
        element;

    var requestAnimFrame = (function () {
      return (
        window.requestAnimationFrame       ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function(/* function */ callback){
          return window.setTimeout(callback, 1000 / 60);
        }
      );
    })();

    function clickListener (elementToReach) {
        return function () {
            var currentTopDocument = getScrollTopDocument(),
                scrollToReach = getScrollTopElement(elementToReach);

            function theLoop () {
                currentTopDocument = getScrollTopDocument();
                if (currentTopDocument === scrollToReach) {
                    return;
                }
                else if (Math.abs(currentTopDocument - scrollToReach) < 10) {
                    window.scrollTo(0, currentTopDocument + (scrollToReach > currentTopDocument ? 1 : -1));
                }
                else {
                    window.scrollTo(0, currentTopDocument + (scrollToReach - currentTopDocument) / 7);
                }
                requestAnimFrame(theLoop);
            }
            requestAnimFrame(theLoop);
            
            return false;
        };
    }

    function getScrollTopElement (e) {
        var top = 0;
        while (e.offsetParent !== undefined && e.offsetParent !== null)
        {
            top += e.offsetTop + (e.clientTop !== null ? e.clientTop : 0);
            e = e.offsetParent;
        }
        return top;
    }

    function getScrollTopDocument () {
        return document.documentElement.scrollTop + document.body.scrollTop;
    }

    for (var i = 0; i < links.length; i++) {
        element = document.querySelector(links[i].attributes.href.value);
        if (element) {
            links[i].onclick = clickListener(element);
        }
    }
})();