#!/bin/bash
cd /var/webapp
ls
sudo npm install
ls
node app.js > /dev/null 2> /dev/null < /dev/null &