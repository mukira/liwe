/* jshint strict: false */

var event_on = function (name, callback) {
  this._listeners = this._listeners || {};
  this._listeners[name] = this._listeners[name] || [];
  this._listeners[name].push(callback);
  return this;
};

var event_off = function (name, callback) {
  var i, listeners;
  this._listeners = this._listeners || {};
  if (!this._listeners[name]) {
    return this;
  }
  listeners = this._listeners[name];
  if (arguments.length === 2) {
    for (i = listeners.length; i >= 0; i--) {
      if (listeners[i] === callback) {
        listeners.splice(i, 1);
      }
    }
  }
  if (arguments.length === 1) {
    delete this._listeners[name];
  }
  return this;
};

var event_trigger = function (name, data) {
  var i, listeners, callback;
  this._listeners = this._listeners || {};
  if (!this._listeners[name]) {
    return this;
  }
  listeners = this._listeners[name];
  for (i in listeners) {
    callback = listeners[i];
    callback(data);
  }
  return this;
};