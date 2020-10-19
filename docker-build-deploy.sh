#!/bin/bash

npm install
npm run-script build
cd client
npm install
ng build --aot=false --optimization --output-hashing=all --extract-css=true --source-map=false --named-chunks=false --vendor-chunk && npm run post-build
cd ..
echo "$DOCKER_PASSWORD" | sudo docker login -u "$DOCKER_USERNAME" --password-stdin
sudo docker build -t bisand/allegutta-portfolio .
sudo docker push bisand/allegutta-portfolio
