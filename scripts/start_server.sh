#!/bin/bash
# Source environment variables for the current session (CodeDeploy agent runs as root/custom user)
source /etc/environment

echo "Starting Java application..."
cd /home/ec2-user/app
nohup java -jar tenant-management-0.0.1-SNAPSHOT.jar > /home/ec2-user/app/app.log 2>&1 &
echo "App started with PID $!"
