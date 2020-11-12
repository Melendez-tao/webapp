#!/bin/bash
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
    -a fetch-config \
    -m ec2 \
    -c file:/opt/cloudwatch-config.json \
    -s
cd /var/webapp
ls
sudo npm install
ls
node app.js > /dev/null 2> /dev/null < /dev/null &