'use strict';

/**
 * Callback for Konami
 * 
 */
function konamiCB () {
  var pageWidth = Math.max(document.body.scrollWidth, document.body.offsetWidth),
    pageHeight = Math.max(document.body.scrollHeight, document.body.offsetHeight),
    wowList = [
      'Wow',
      'Such amazing!',
      'Amaze powered',
      'very connected',
      'Such speed',
      'Mind blow',
      'much fast',
      'so futurist',
      'javascript luv',
      'so html',
      'much easy',
      'socket 4 life',
      'much sockets',
      'r u a dev?',
      'simple inside',
      'much future',
      'so fab\'',
      ''
    ],
    colorList = [
      'yellow',
      'blue',
      'red',
      'aqua',
      'orange',
      'black',
      'green',
      'white',
      'purple'
    ];

  setInterval(function () {
    var newWord = document.createElement('span');
    newWord.className = 'doge';
    newWord.innerHTML = wowList[Math.floor(Math.random() * (wowList.length - 0.01))];
    newWord.style.top = (Math.random() * pageHeight) + 'px';
    newWord.style.left = (Math.random() * pageWidth) + 'px';
    newWord.style.fontSize = (Math.floor(Math.random() * 8) * 0.25 + 1) + 'em';
    newWord.style.color = colorList[Math.floor(Math.random() * (colorList.length - 0.01))];
    document.body.appendChild(newWord);
  }, 200);
}