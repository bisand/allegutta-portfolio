#!/bin/bash

echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
docker build -t bisand/allegutta-portfolio .
docker push bisand/allegutta-portfolio
