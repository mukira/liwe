'use strict';

/**
 * Set up, the set up
 ******************************************************
 */
var express = require('express'),
	path = require('path'),
	http = require('http'),
	sockjs = require('sockjs'),
	config = require('./../config'),
	socketRouter = require('./source/controller/socketRouter'),
  keyRequest = require('./source/controller/keyRequest');


/**
 * Socket bus
 * connected, fast, motherfucker.
 ******************************************************
 */

var sock = sockjs.createServer();

sock.on('connection', function (socket) {
	socketRouter.onOpen(socket);
	socket.on('data', socketRouter.onData);
	socket.on('close', socketRouter.onClose);
});


/**
 * Client server
 * apache style like, with express
 ******************************************************
 */

var app = express();
var server = http.createServer(app);
sock.installHandlers(server, {prefix: config.routes.socket});
server.listen(config.app.port);
console.log('Listening on port ' + config.app.port);

config.app.publicFolder = path.resolve(__dirname + '/' + config.app.publicFolder);
app.use(express.static(config.app.publicFolder));
app.use(express.compress());
app.use(express.bodyParser());

// Params definitions
app.param(function(name, fn){
  if (fn instanceof RegExp) {
    return function(req, res, next, val){
      var captures;
      if (captures = fn.exec(String(val))) {
        req.params[name] = captures;
        next();
      } else {
        next('route');
      }
    };
  }
});
app.param('windowId', /^[a-zA-Z0-9]{6,8}$/);

// Routes
app.get('/', function(req, res) {
	res.sendfile(config.app.publicFolder + '/home.html');
});

app.get('/:windowId', function(req, res) {
	res.sendfile(config.app.publicFolder + '/remote.html');
});

app.get(config.routes.iframe, function(req, res) {
	res.sendfile(config.app.publicFolder + '/window.html');
});

app.post(config.routes.requestKey, function(req, res) {
  keyRequest(req.body, function (success, error) {
    if (success) {
      res.json(200, { success: success });
    }
    else {
      res.json(200, { error: error });
    }
  });
});
