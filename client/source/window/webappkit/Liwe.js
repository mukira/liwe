/* global event_on, event_off, event_trigger, Remote, CONFIG */

(function () {
  'use strict';

  // Insert dependencies
  /* Event.js */
  /* Remote.js */

  /**
   * Liwe class
   * Main object of the API
   * The one to establish connection,
   * manage remotes and events.
   *
   * An instance is one connection (pipe).
   * This constructor take one argument: a config
   * object. This object must contain your key of
   * connection.
   *
   * Warning, this script does not provide any QRcode generator
   * library.
   *
   * @constructor
   * @this {Liwe}
   * @param {object} config Configuration object for the connection
   */
  function Liwe (config) {
    // Test the config
    if (!this._configCheck(config)) {
      throw 'Liwe: The config is not valid';
    }
    this.config = config;
    this.remotes = {};
    this.remoteLength = 0;
  }

  /* Public properties ************************************
   *
   */

  /**
   * @property
   * @name config
   * @descriptionConfig object about the instance.
   * The same given to the constructor when the
   * instance has been created.
   *
   * @type {object}
   */
  Liwe.config = null;

  /**
   * @property
   * @name info
   * @description
   * Passport object about the instance.
   * Once connected, the instance got a info
   * object containg all relative information about
   * the pipe. Like, the URL for remote connection,
   * or if there's any connection restrictions..
   *
   * @type {object}
   */
  Liwe.info = null;

  /**
   * @property
   * @name remotes
   * @description
   * Object which contain the remotes connected.
   * The key for each object is their ID.
   *
   * @type {object}
   */
  

  /**
   * @property
   * @name remoteLength
   * @description
   * Number of remotes connected
   *
   * @type {integer}
   */
  

  /**
   * @method
   * @name connect
   * @this {Liwe}
   * @description
   * Method to set up the iframe and establish
   * the connection. This will use the config object
   * used to create the instance. The events must be
   * set up before to call the method, otherwise, some
   * events will be missings.
   *
   */
  Liwe.prototype.connect = function () {
    //# Check if config is set, other wise ERROR bitch
    try {
      this._iframe = document.createElement('IFRAME');
      this._iframe.setAttribute('src', this._IFRAME_URL);
      this._iframe.style.width = '0px';
      this._iframe.style.height = '0px';
      this._iframe.style.display = 'none';
      document.body.appendChild(this._iframe);
      window.addEventListener('message', this._postReceptor.bind(this), false);
    }
    catch (e) {
      this._trigger('error', 'Connection process error | ' + e.name + ': ' + e.message);
    }
  };

  /**
   * @method
   * @name disconnect
   * @this {Liwe}
   * @description
   * Method to disconnect and close the connection.
   * This call will automatically disconnect all the
   * connected remotes, and kill this instance.
   *
   * The method will return nothing, this is why the
   * events `disconnect` and `error` must have listeners.
   *
   */
  Liwe.prototype.disconnect = function () {
    try {
      this._postSender({
        command: 'disconnect'
      });
    }
    catch (e) {
      this._trigger('error', 'Cannot send disconnect command');
    }
  };

  /**
   * @method
   * @name debug
   * @this {Liwe}
   * @description
   * Wrapper for for console.log if the debug
   * mode is enabled.
   *
   * 
   */
  Liwe.prototype.debug = function () {
    if (this.config && this.config.debug) {
      console.log.apply(console, arguments);
    }
  };

  /**
   * @method
   * @name on
   * @this {Liwe}
   * @description
   * Setup a listener for an event.
   * At the moment the class will trigger only:
   *
   * - `connect`: when the pipe is successfully connected.
   * The object given in parameter is a `info` object
   * containing relative informations about the connection.
   *
   * {
   *   url: 'http://li.we/r/1337me'
   * }
   *
   * - `error`: when a problem occurs, because it can happen, and
   * it will happen, for sure.
   *
   * - `new_remote`: when a remote get connected. The remote
   * object will be given as parameter of the listener function.
   *
   * - `disconnect`: when the pipe gets disconnected.
   *
   * @param {string} name Name of the event to listen
   * @param {function} listener Listener function for the event
   *
   */
  Liwe.prototype.on = event_on;

  /**
   * @method
   * @name off
   * @this {Liwe}
   * @description
   * Remove a listener for an event.
   * If only the event name is given, all the listeners
   * for this event will be removed.
   * If event name and listener are precised, all the
   * occurences of this listener for this event will be
   * removed.
   *
   * @param {string} name Name of the event to listen
   * @param {function} listener Listener function for the event [optional]
   *
   */
  Liwe.prototype.off = event_off;


  /* Private properties ***********************************
   *
   */

  /**
   * @property
   * @name _IFRAME_URL
   * @description
   * Private
   * This is the iframe url.
   *
   * @type {string}
   */
  Liwe.prototype._IFRAME_URL = 'http:///** @app.domain **//** @routes.iframe **/';

  /**
   * @property
   * @name _IFRAME_ORIGIN
   * @description
   * Private
   * This is the iframe origin.
   * Technically this is just the host URL which
   * will be used to compare postMessage origin,
   * and be sure the data come from the iframe.
   *
   * @type {string}
   */
  Liwe.prototype._IFRAME_ORIGIN = 'http:///** @app.domain **/';

  /**
   * @property
   * @name _iframe
   * @description
   * Private
   * Contain the iframe DOM element of the
   * instance.
   *
   * @type {object}
   */
  Liwe._iframe = null;

  /**
   * @property
   * @name _iframe_url
   * @description
   * Private
   * Contain the iframe url for this instance
   *
   * @type {string}
   */
  Liwe._iframe_url = null;

  /**
   * @method
   * @name configCheck
   * @this {Liwe}
   * @description
   * Private
   * Method to check the config file
   *
   * @param {object} config Config object
   * @return {boolean} True if the config is ok
   */
  Liwe.prototype._configCheck = function (config) {
    var keyPattern = new RegExp('^[a-zA-Z0-9]{24}$');
    if (!config) {
      return false;
    }
    if (!config.key || typeof config.key !== 'string' || !keyPattern.test(config.key)) {
      return false;
    }
    return true;
  };

  Liwe.prototype._getAuthKey = function () {
    if (!this._authKey) {
      this._authKey = this._generateKey(24);
    }
    return this._authKey;
  };

  Liwe.prototype._generateKey = function (length) {
    var output = '';
    var src = '1234567890qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM';
    while (length > 0) {
      output += src[Math.floor(Math.random()*62)];
      length--;
    }
    return output;
  };

  /**
   * @method
   * @name _postReceptor
   * @this {Liwe}
   * @description
   * Private
   * Method which receive the window messages
   * A filter will be applied to be sure the messages
   * are for this instance.
   *
   * @param {object} event New message event
   */
  Liwe.prototype._postReceptor = function (e) {
    if (e.origin !== this._IFRAME_ORIGIN) {
      return;
    }
    this.debug('W << F', e.data);
    this._eventRouter(e.data);
  };

  /**
   * @method
   * @name _eventRouter
   * @this {Liwe}
   * @description
   * Private
   * Redirect the messages to the object
   * concerned.
   *
   * @param {string} event New message event
   */
  Liwe.prototype._eventRouter = function (e) {
    var remote, connectData;
    e = JSON.parse(e);
    switch (e.command) {

    // Stream case, most frequent, so the first to test
    case 'stream':
      if (!this.remotes[e.remoteId]) {
        this._trigger('error', 'A stream event for an unexisting remote has arrived');
        return;
      }
      this.remotes[e.remoteId]._eventRouter(e.data);
      break;

    // Never gonna give you up, the link between us is stronger than anything
    case 'roll':
      //# Do something mother fucker
      break;

    // New remote connection: oh frieeeend
    case 'new_remote':
      remote = new Remote(e.remoteId, this, e.data);
      this.remotes[e.remoteId] = remote;
      this.remoteLength++;
      this._trigger('new_remote', remote);
      break;

    // Closing remote connections
    case 'close_remote':
      if (!this.remotes[e.remoteId]) {
        return;
      }
      remote = this.remotes[e.remoteId];
      delete this.remotes[e.remoteId];
      this.remoteLength--;
      remote._trigger('disconnect', e.data);
      this._trigger('close_remote', remote);
      break;

    // Status, for connection and disconnections
    case 'status':
      this.info = e.data;
      if (e.data.isConnected) {
        this._trigger('connect', e.data);
      }
      else {
        this._trigger('error', 'Error: ' + e.data.label);
        this._trigger('disconnect', e.data);
      }
      break;

    case 'local_gateway':
      switch (e.data.type) {
      // Error case
      case 'error':
        this._trigger('error', e.data);
        break;

      // Start bitch
      case 'ready':
        connectData = {
          keyId: this.config.key,
          maxRemoteConn: this.config.maxRemoteConn || 0,
          localKey: this._getAuthKey()
        };
        this._postSender({
          command: 'connect',
          data: connectData
        }, true);
        break;
      }
      break;
    }
  };

  /**
   * @method
   * @name _postSender
   * @this {Liwe}
   * @description
   * Private
   * Method to send window messages to the iframe
   * A filter will be applied to be sure the messages
   * are for this instance.
   *
   * @param {object} msg Command to send
   * @param {boolean} raw Market to send the msg with auth key
   */
  Liwe.prototype._postSender = function (msg, raw) {
    if (!this._iframe) {
      throw 'Instance not connected';
    }
    msg = ((!raw && this._getAuthKey()) || '') + JSON.stringify(msg);
    this._iframe.contentWindow.postMessage(msg, '*');
    this.debug('W >> F', msg);
  };

  /**
   * @method
   * @name _trigger
   * @this {Liwe}
   * @description
   * Private
   * Method to trigger an event
   *
   * @param {object} msg Command to send
   */
  Liwe.prototype._trigger = event_trigger;

  /* Set namespace ****************************************
   *
   */
  window.Liwe = Liwe;

})();
