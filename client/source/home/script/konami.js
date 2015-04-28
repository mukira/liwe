'use strict';

/**
 * Konami
 *
 * What are you lookin' at ?
 * You're probably thinking why there is a strange jQuery plugin
 * called Konami. But I don't think I need to say more, you 
 * guessed what's going on here ;-)  
 *
 * The constructor need only a function or rewrite the
 * secretLevel method.
 *
 */

/**
 * Konami
 * Class constructor 
 * 
 * @param callback function  Function to apply once the code done
 */
function Konami (callback) {
  this.position = 0;
  this.callback = callback;
  window.addEventListener('keydown', this.updateStatus.bind(this));
}

/**
 * code
 * keyCode combinaison of the Konami code 
 * 
 */
Konami.prototype.code = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];

/**
 * updateStatus
 * Script applied at every keypress to update the status 
 * 
 */
Konami.prototype.updateStatus = function (e) {

  // KeyCode test
  if(e.keyCode !== this.code[this.position]) {
    this.position = 0;
    return;
  }

  // Success!
  this.position += 1;
  if (this.code.length === this.position) {
    this.position = 0;
    this.callback();
  }
};