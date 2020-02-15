const path = require('path');
const fs = require('fs');
const util = require('util');

// get application version from package.json
const appVersion = require('../package.json').version;

// promisify core API's
const readDir = util.promisify(fs.readdir);
const writeFile = util.promisify(fs.writeFile);
const readFile = util.promisify(fs.readFile);

console.log('\nRunning post-build tasks');

// our version.json will be in the dist folder
const versionFilePath = path.join(__dirname + '/../../client_dist/version.json');

let mainHash = '';
let mainBundleFiles = [];

// RegExp to find main.bundle.js, even if it doesn't include a hash in it's name (dev build)
let mainBundleRegexp = /^(main-)([a-z0-9]*.)([a-f0-9]*)(.js)$/;

function escapeRegExp(str) {
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function replaceAll(str, find, replace) {
    return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

// read the dist folder files and find the one we're looking for
readDir(path.join(__dirname, '../../client_dist/'))
    .then(files => {
        mainBundleFiles = files.filter(f => {
            console.log(f);
            let found = mainBundleRegexp.test(f);
            console.log(found);
            return found;
        });

        if (mainBundleFiles) {
            let matchHash = mainBundleFiles[0].match(mainBundleRegexp);

            // if it has a hash in it's name, mark it down
            if (matchHash.length > 3 && !!matchHash[3]) {
                mainHash = matchHash[3];
            }
        }

        console.log(`Writing version and hash to ${versionFilePath}`);

        // write current version and hash into the version.json file
        const src = `{"version": "${appVersion}", "hash": "${mainHash}"}`;
        return writeFile(versionFilePath, src);
    })
    .then(async () => {
        // main bundle file not found, dev build?
        if (!mainBundleFiles) {
            return;
        }
        mainBundleFiles.forEach(async mainBundleFile => {
            console.log(`Replacing hash in the ${mainBundleFile}`);

            // replace hash placeholder in our main.js file so the code knows it's current hash
            const mainFilepath = path.join(__dirname, '../../client_dist/', mainBundleFile);
            const mainFileData = await readFile(mainFilepath, 'utf8');
            const replacedFile = replaceAll(mainFileData, '{{POST_BUILD_ENTERS_HASH_HERE}}', mainHash);
            // const replacedFile = mainFileData.replace('{{POST_BUILD_ENTERS_HASH_HERE}}', mainHash);
            return writeFile(mainFilepath, replacedFile);
        });
    })
    .catch(err => {
        console.log('Error with post build:', err);
    });
