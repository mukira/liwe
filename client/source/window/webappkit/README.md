# Liwe: screen side (webapp)
## Explainations and API demo


```javascript
/**
 * Liwe contructor
 * Main object to generate a connection.
 * One object is given in parameter, containing all the
 * differents options necessary to start.
 *
 */
var myLiwe = new Liwe({
  key: 'vSd62e3e4r5tqa2w54u7i8o9'
  maxRemoteConn: 2
});


/**
 * Events
 *
 * the Liwe instance got an `on` method to catch events.
 * here is the list of events:
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
 */
myLiwe.on('connect', function (info) {
  document.getElementById('prompt').innerText = info.url;
});
myLiwe.on('error', function (error) {
  console.log('Liwe [error]', error);
});
myLiwe.on('new_remote', function (remote) {
  if (myLiwe.remoteLength !== 0) {
    remote.disconnect();
    return;
  }
  remote.setUI('gyro');
  remote.on('gyro', function (data) {
    my3Dobject.updatePos(data);
  });
});

/**
 * Liwe instances got different attributes
 *
 * - `remoteLength` {integer}: Number of connected remote on this instance
 * - `remote` {object}: Object containing all connected remoted of this instance
 */

/**
 * Connect
 * Where the magic starts...
 * The method create the iframe and build the interconnection
 * to communicate.
 */
myLiwe.connect();

```



Scenario:

- Load 'liwe.js' on the webapp
- Instantiate a Liwe object with config
- Define listeners of this object
- Start the instance
  - Create the iframe
  - Load the iframe code
  - Try to make the socket connection
- Liwe wait for an event ('ready' or 'error')
- Send auth message to iframe
- iframe send the message to server
- [find a way to authenticate messages from liwe instance]
