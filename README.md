![Liwe logo](https://raw.github.com/liwe/liwe/master/client/source/assets/images/documentation_logo.png)
## an open source remote control

[![Join the chat at https://gitter.im/liwe/liwe](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/liwe/liwe?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Liwe is a service for web developers to use smartphones as a remote for their webapp. Built in JavaScript, a Node server and a JavaScript API.

There's nothing new behind this idea, it exist from ages. But it's always a pain to implement, just for a simple controller. So the idea behind Liwe is giving the best for everybody.

For developers:

- no servers, a dummy html page is enough
- easy and evolutive JavaScript API
- easy to scale

For the final user:

- no app to install
- no registration or other process
- a responsive and fast html app
- multiplatform

The remote has been built in the idea to provide the best experience. JavaScript can access to most of the sensors : accelerometer, gyroscope, touch screen, microphone, camera, localisation..  it's time to get the most of it.

### How this thing works?

![Liwe flux plan](https://raw.github.com/liwe/liwe/master/client/source/assets/images/documentation_plan.png)

Here is the process, step by step:

- Your WebApp must include the JavaScript file from the running server and instantiate a Liwe object with a valid key.
- The instance will establish a WebSocket connection with the server and will return a URL
- Your WebApp must display this URL to let your users to connect
- When a user will go to the link, your Liwe instance will receve a `new_remote` event containing a Remote object.
- From this remote object, you can set the UI (user interface) you want from the three available :
  - *button*: a simple big button
  - *touch*: turn the phone into a touchpad to get touch gestures
  - *gyro*: to get gyro/compass informations
- A command will be sent to the smartphone. Once set up, all the data generated will be send to the WebApp which will be free to use it for whatever you want to do.
- At any point the WebApp can change the UI on the Remote.
- Then the WebApp can deside to disconnect the Remote, or the remote will leave first. In any case, the WebApp will be informed.

One more thing, you can have more than one remote at the time. Every remote got a color code to differentiate them. More remotes, more fun :)

Please check the demo apps available on [GitHub](http://github.com/liwe). I recommend the [pushthebutton app](https://github.com/liwe/app-pushthebutton) to start and the awful [documentation](http://github.com/liwe/liwe/wiki).

For now, [liwe.co](http://liwe.co) is running the Liwe project, and people can request a key to use it. But the good side of having this project open source is to not make users depending on a unique server. If liwe.co shut down, anybody can create another server.

Unfortunately, at the moment **this project is a prototype**, a proof of concept and nothing else. For many reasons:

- No proper protocol defined
- Old package dependencies
- Not flexible enough to add new remote UIs
- Massive lack of security (I believe so..)
- **NO UNIT/E2E TESTS!** (YES I KNOW OMG WHADAFOLK AND STUFF)

...and this is why I need your help.

### Contributors

If this project find contributors it would be brilliant to join the ideas and rebuild it to get a performant system and implement new technologies like WebRTC (the only reason I didn't started with it was because of iOS). Making the connections more efficient and servers faster. Please read `PLAN.md` and `CONTRIBUTING.md`.

All ways are good to share ideas: tweet me [@mxwllt](http://twitter.com/mxwllt), post an issue, join the [Gitter chat](http://gitter.im/liwe/liwe).

### FAQ

> Why shall I use a remote system for my WebApp? The mouse does pretty well his job, duh!

*For a basic website, this project doesn't make any sense (except in some cases maybe). But let's imagine the situation of an event, and you need to display information on a big screen like a big TV. By creating a WebApp with Liwe, you give interaction to your users.*

> What about the latency?

*Realtime comminication rely on the network. The ideal situation is to have the WebApp and the remote connected on Wi-Fi, but it's not a good base to test. I've been using Liwe on a iPhone 4 (which is slow as fork) on a 'alternative' 3G network, and my computer connected on classic ADSL. The results are pretty good, of course there's a bit of latency, but most of the time it's not perceptible.*

> What about compatibility?

*Ok, I admit it, I didn't really check about that. Chrome and Firefox are brilliant. Safari seems ok, but some proper tests are required. About Internet Explorer, well...  I never really dare to try but I will have to.*

> Is liwe.co ready to stand a big user charge?

*I hope so. I'm praying. Actually I don't know, this also why it's a prototype. I've never built a node server which will be public. But I'm sure it will crash.*

> What a real NodeJS developer would think about the quality of this repo?

*RUN FOR YOUR LIFE! RUUUUUUUUUUUNN!*

> Why the name Liwe?

*Because 42. No actually I needed something short for the URL.*

### Technologies

#### Server side

- **NodeJS + NPM**: server platform
- **MongoDB**: to store and manage keys
- **ExpressJS**: the web server
- **SockJS**: to establish websocket connections

#### Remote side

- **AngularJS**: to build the app

#### Across platforms

- **Gulp**: make the build
- **Bower**: download frontend dependencies

### Make

```bash
$ git clone <repo-url>
$ cd liwe
$ ./build.sh             # Build the production code (so follow the instructions)
$ node server/server.js  # Run the server (root rights required)
```
