# iframe protocol

This sandbox will parse messages to check what to send. All messages between the iframe and the webapp script will be done via `postMessage`.

## From iframe to webapp

Only messages can be sent.
//# Think about a secure way to communicate with the parent script


### raw messages from server

The string must be be checked via regexp.

### `local_gateway`

Used for protocol messages from the iframe to the webappkit.
The data attribute got a replica of the event object : `type` + `data`

#### `error`

//# Set up error index for documentation
- `error_id` {int}: Error ID
- `error_label` {string}: Error message

#### `ready`

Call from the iframe to mention the connect status of the socket. The authentication process can begin. Waiting for a call from the webapp.
