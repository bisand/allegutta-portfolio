#!/bin/bash

npm install
cd client
npm install
ng build --prod=true
cd ..
sudo docker build -t bisand/allegutta-portfolio .
sudo docker push bisand/allegutta-portfolio
