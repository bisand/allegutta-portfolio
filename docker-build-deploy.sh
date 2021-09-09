#!/bin/bash

npm install
npm run-script build
pushd client
npm install
ng build --aot=true --build-optimizer=true --optimization=true --output-hashing=all --extract-css=true --source-map=false --named-chunks=false --vendor-chunk && npm run post-build
popd
echo "$DOCKER_PASSWORD" | sudo docker login -u "$DOCKER_USERNAME" --password-stdin
sudo docker build -t bisand/allegutta-portfolio .
sudo docker push bisand/allegutta-portfolio
