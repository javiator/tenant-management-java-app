#!/bin/bash
echo "Stopping any existing Java application..."
pkill -f 'java -jar' || echo "No process found"
