# Server protocol

## Message structure

SockJS allow only strings, so object are stringified before.

```
{
	command: {string},
	remoteId: {string}, # For pkg from remote to server
	data: {object}
}
```

## From client to server

### `connect`

This route is used to pass the socket to a recognised user of the network. It can come from a remote or a window.

From a window:

 - `type` {char}: a simple char, `w` to specify window
 - `domain` {string}: domain from where the socket is initialised
 - `keyId` {string}: auth key
 - `maxRemoteConn` {integer}: maximum simultaneous remote connections allowed

From a remote:

 - `type` {char}: a simple char, `r` to specify remote
 - `windowId` {string}: auth remote
 - `uiAllowed` {array}: list of UI enabled by the remote

### `set_ui`

Ask to set a new user interface on a remote.

 - `remote_id` {string}: Id of the remote
 - `ui` {string}: UI name to set up

### `stream`

Data streaming from the server. This is supposed to be verified and validated on server side.

 - `ui` {string}: UI related to the data
 - `data` {object}: data to send

### `rick` [to implement]

Ask the server if the connection is still on. It should reply via a command `roll`. Because, never gonna give you, never gonna let you down, never around and around, and hurt you. No extra data is sent.

### `disconnect_remote`

Sent from the window to disconnect a remote.

 - `remoteId` {string}: Id of the remote
 - `message` {string}: text to display on the remote
 - `wasSuccess` {boolean}: to know if we should display the goodbye in red or blue

### `disconnect`

Sent from a window or a remote to disconnect itself. From a window, no data parameter is required.

From a remote:

 - `message` {string}: text to display on the remote
 - `wasSuccess` {boolean}: to know if we should display the goodbye in red or blue



## From server to client

### `status`

Give back the status of the connection.

 - `isConnected` {boolean}: status of the connection
 - `windowId|remoteId` {string}: identifier of the device
 - `color` {string}: remote color on 6 hexs [only on remote]
 - `url` {string}: url access for remotes [only on window]

### `new_remote`

Call from the server to window to notify a new remote has been connected.

 - `remoteId` {string}: Id of the new remote
 - `uiAllowed` {array}: list of UI supported by the remote
 - `color` {string}: remote color Id

### `set_ui`

Command sent from the server to set a new user interface

 - `ui` {sting}: name of the UI to set up

### `stream` [incomplete: remoteId to insert]

Data streaming from the server. This is supposed to be verified and validated on server side.

 - `remoteId` {string}: Remote ID where come from the data
 - `ui` {string}: UI related to the data
 - `data` {object}: data to send (check 'stream data type' section)

### `close_remote`

Sent to the window to alert the disconnection of a remote.

 - `remoteId` {string}: Id of the new remote

### `roll` [to implement]

Sent to clients (windows and remotes) to validate the connection is still on. This is the response for a `rick` command. No extra data is sent.

### `disconnect`

At the moment this command is reserved to remotes, and not for windows. It just mention the disconnection of the device.

 - `message` {string}: text to display on the remote
 - `wasSuccess` {boolean}: to know if we should display the goodbye in red or blue


## Stream data type

### `button`

Button UI, simple, nothing more basic, you can only press the button. I had three types, but actually I'm going to remove `click`. Simply because it just overload the stream, so only `press`and `release`.

 - `type` {string}: event type, only `press` or `release`
 - `id` {integer}: event counter

### `gyro`

Gyro UI, send in real time the compass coordinates of the device. This UI is quite heavy in term of bandwidth ressources. One package is sent every 250ms (4/s).

 - `id` {integer}: event counter
 - `x`, `y`, `z` {integer}: accelerometer coordinates
 - `alpha`, `beta`, `gamma` {integer}: compass coordinates

### `touch`

Touch UI, send different type of events related to touch interaction on remote screen.
