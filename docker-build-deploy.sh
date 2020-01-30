#!/bin/bash

cd client
ng build --prod=true
cd ..
docker build -t bisand/allegutta-portfolio .
docker push bisand/allegutta-portfolio
