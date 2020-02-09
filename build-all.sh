#!/bin/bash

npm install
npm run-script build
cd client
npm install
ng build --prod=true
cd ..
