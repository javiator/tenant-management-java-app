#!/bin/bash
echo "Providing time for app startup..."

# Try for 5 minutes (30 * 10s)
for i in {1..30}; do
    # Check if we can connect and get a 200 OK
    # --silent: Don't show progress meter
    # --output /dev/null: Throw away the body
    # --write-out "%{http_code}": Print the status code
    HTTP_CODE=$(curl --write-out "%{http_code}\n" --silent --output /dev/null http://localhost:8080/actuator/health)
    
    if [ "$HTTP_CODE" == "200" ]; then
        echo "Health check passed!"
        exit 0
    fi
    
    echo "Attempt $i: Health check returned $HTTP_CODE. Checking again in 10s..."
    sleep 10
done

echo "Health check failed after 300 seconds."
exit 1
