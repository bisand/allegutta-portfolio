#!/bin/sh

npm install
npm run-script build
cd client
npm install
ng build --aot=true --build-optimizer=true --optimization=true --output-hashing=all --source-map=false --named-chunks=false --vendor-chunk && npm run post-build
cd ..
