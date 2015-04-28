#!/bin/bash
# Build the prod code

# Init vars
force=false
abort=false

# Check the force parameter
for var in "$@"
do
  if [ "$var" = "--force" ]; then
    force=true
  fi
done

# Check if the repo has been configured first
while true; do
  read -p "Have you configured 'server/config.js' first? [y/n]" yn
  case $yn in
    [Yy]* ) break;;
    [Nn]* ) exit;;
    * ) echo "Please answer 'y' or 'n'.";;
  esac
done

# Dependencies check
if !(hash mongo 2>/dev/null); then
  echo "MongoDB does't seems to be installed."
  echo "Check http://docs.mongodb.org/manual/installation/ for more information"
  abort=true
fi
if !(hash npm 2>/dev/null); then
  echo "NPM and Node are required."
  echo "Check http://nodejs.org/ for more help"
  abort=true
fi
if !(hash bower 2>/dev/null); then
  echo "Bower is required."
  echo "Run this command with sudo rights: npm install -g bower"
  abort=true
fi
if !(hash gulp 2>/dev/null); then
  echo "Gulp is required."
  echo "Run this command with sudo rights: npm install -g gulp"
  abort=true
fi

if !($force) && $abort; then
  echo "The build has been cancelled, please install the required dependencies before continue."
  echo "You can force the install by using '--force'"
  exit 0
fi

# Build client
cd client
bower install
npm install
gulp build

# Install server packages
cd ../server
npm install