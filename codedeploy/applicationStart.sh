#!/bin/bash

cd /var/webapp
ls
sudo npm install
ls
sudo node app.js > /dev/null 2> /dev/null < /dev/null &
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
    -a fetch-config \
    -m ec2 \
    -c file:/var/webapp/cloudwatch-config.json \
    -s
