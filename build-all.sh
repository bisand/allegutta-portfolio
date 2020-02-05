#!/bin/bash

npm install
tsc -p tsconfig.json
cd client
npm install
ng build --prod=true
cd ..
