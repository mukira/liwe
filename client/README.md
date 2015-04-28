# Client side

## How to start?

Some packages are required to work on this repo. The task runner used is Gulp, it's included in the development packages but also need to be installed globally on your machine.

```bash
# To install Gulp globally (yep, you need admin rights to do that)
sudo gulp install -g gulp
```

Then after, these simple commands can build your system.

```bash
npm install       # Download Node packages
bower install     # Download JavaScript libraries
gulp build        # Run tasks to build the production code of the app
```

## Structure

All the code is in the `source` folder, which contain 4 subfolders :

- `assets`: store the fonts, pictures, SVGs and other assets
- `remote`: code about the remote
- `home`: frontpage of the domain, to introduce the app
- `window`: public script for webapps and the sandbox iframe to communicate