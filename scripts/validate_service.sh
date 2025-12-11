#!/bin/bash
echo "Waiting for app to start..."
sleep 10
curl -v http://localhost:8080/actuator/health || exit 1
