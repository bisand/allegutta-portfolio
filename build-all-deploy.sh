#!/bin/bash

npm install
npm run-script build
cd client
npm install
ng build --prod=true && npm run post-build
cd ..
echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
sudo docker build -t bisand/allegutta-portfolio .
sudo docker push bisand/allegutta-portfolio
