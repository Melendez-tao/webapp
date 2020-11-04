#!/bin/bash
cd /var/webapp
npm install
npm uninstall nodemon
sudo npm install -g --force nodemon