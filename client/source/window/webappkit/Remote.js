/* jshint strict: false */
/* global event_on, event_off, event_trigger */

/**
 * Remote class
 * A remote instance is an object made to represent a
 * connected remote on the session.
 * All controls can be made from this object.
 * Listening events, setup a new UI, get info about it,
 * get UI events.
 *
 */

/**
 * [Remote description]
 * @param {string} remoteId Remote ID
 * @param {Liwe} manager Parent manager of the remote
 * @param {object} config Configurtion object of the remote instance
 */
function Remote (remoteId, manager, config) {
  this.id = remoteId;
  this.manager = manager;
  this.config = config;
}

/* Public properties ************************************
 *
 */

/**
 * @method
 * @name connect
 * @this {Remote}
 * @description
 * Method to set up a new UI on this remote.
 * This will just send a command to the remote.
 * Be prepaired to listen the events before
 * to set up a new UI.
 *
 * @param {string} uiName  Name of the UI to set up
 * @param {string} message Message to display on promptr
 */
Remote.prototype.setUI = function (uiName, message) {
  if (this.config.uiAllowed.indexOf(uiName) === -1) {
    this._trigger('error', 'This remote does not support the ' + uiName + ' UI.');
    this.manager._trigger('error', 'Remote [' + this.id + '] does not support the ' + uiName + ' UI.');
    return;
  }
  this.manager._postSender({
    command: 'set_ui',
    data: {
      remoteId: this.id,
      ui: uiName,
      message: message || ''
    }
  });
};

/**
 * @method
 * @name connect
 * @this {remote}
 * @description
 * Made to send a signal to disconnect the remote
 * Nothing is returned.
 *
 * @param {string} message Reason for disconnection
 * @param {boolean} wasSuccess To know if the disconnection wasn't due to a problem
 */
Remote.prototype.disconnect = function (message, wasSuccess) {
  this.manager._postSender({
    command: 'disconnect_remote',
    data: {
      remoteId: this.id,
      message: message,
      wasSuccess: wasSuccess
    }
  });
};

/**
 * @method
 * @name on
 * @this {Remote}
 * @description
 * Setup a listener for an event of the remote instance.
 * The instance will trigger events from UI or transformed ones.
 * Like 'swipe_top', 'zoom_in', 'rotate'... these are transformed
 * from touch events.
 * The complete list should come soon.
 *
 * @param {string} name Name of the event to listen
 * @param {function} listener Listener function for the event
 *
 */
Remote.prototype.on = event_on;

/**
 * @method
 * @name off
 * @this {Remote}
 * @description
 * Remove a listener for an event.
 * If only the event name is given, all the listeners
 * for this event will be removed.
 * If event name and listener are precised, all the
 * occurences of this listener for this event will be
 * removed.
 *
 * @param {string} name Name of the event to stop listenning
 * @param {function} listener Listener function for the event [optional]
 *
 */
Remote.prototype.off = event_off;



/**
 * @method
 * @name _eventRouter
 * @this {Remote}
 * @description
 * Not for an external use.
 * Redirect the messages to the object
 * concerned.
 *
 * @param {object} e New message event
 */
Remote.prototype._eventRouter = function (e) {
  if (e.constructor === Array) {
    for (var i in e) {
      this._eventRouter(e[i]);
    }
    return;
  }

  if (e.ui) {
    // Special treatment, for formatted events
    if (e.ui === 'touch') {
      this._parseTouchEvent(e.data);
    }
    else {
      this._trigger(e.ui, e.data);
    }
  }
};

/**
 * @method
 * @name _parseTouchEvent
 * @this {Remote}
 * @description
 * Not for an external use.
 * Catch RAW event from `_eventRouter` and
 * parse them (if necessary) to new events.
 *
 * RAW events:
 * touch_move_[start|update|end]
 * touch_scale_[start|update|end]
 *
 * Simple events:
 * touch_swipe
 * touch_scroll
 * touch_zoom
 * touch_rotate
 *
 * @param {object} data New message event
 */
Remote.prototype._parseTouchEvent = function (data) {
  // First, let trigger the RAW event
  this._trigger('touch_' + data.type + '_' + (data.status || 'update'), data);

  // Second, parse and transform data
  if (data.status === 'end') {
    if (!data.data || !data.data.move) {
      this._trigger('touch_tap', {
        id: data.id,
        data: {}
      });
      return;
    }
    var x = data.data.move.x, y = data.data.move.y, dir;
    dir = (x > y) ? (x > -y ? 'right' : 'up') : (x > -y ? 'left' : 'down');

    switch (data.type) {
    case 'move':
      this._trigger('touch_swipe', {
        id: data.id,
        direction: dir,
        data: data.data
      });
      break;

    case 'scale':
      this._trigger('touch_scroll', {
        id: data.id,
        direction: dir,
        data: data.data
      });
      this._trigger('touch_zoom', {
        id: data.id,
        zoom: data.data.scale,
        data: data.data
      });
      this._trigger('touch_rotate', {
        id: data.id,
        rotation: data.data.rotation,
        data: data.data
      });
    }
  }
};

/**
 * @method
 * @name _trigger
 * @this {Remote}
 * @description
 * Private
 * Method to trigger an event
 *
 * @param {object} msg Command to send
 */
Remote.prototype._trigger = event_trigger;
