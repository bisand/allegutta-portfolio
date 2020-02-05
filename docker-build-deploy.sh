#!/bin/bash

npm install
tsc -p tsconfig.json
cd client
npm install
ng build --prod=true
cd ..
sudo docker build -t bisand/allegutta-portfolio .
sudo docker push bisand/allegutta-portfolio
