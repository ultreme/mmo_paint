#!/bin/bash

set -e

# Build
docker build -t calc/mmo-paint .

# Run
docker stop calc-mmo-paint &> /dev/null || true
docker rm calc-mmo-paint &> /dev/null || true
docker run -d -p 5821:5821 --name calc-mmo-paint -d calc/mmo-paint
