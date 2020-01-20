const util = require('util');
const fs = require('fs');
const path = require('path');
const rest = require('restler');
const NodeRSA = require('node-rsa');
const tls = require('tls');

function login(user, pass, fn) {
    var auth = encryptLogin(user, pass, 'NEXTAPI_TEST_public.pem');
    var opts = {
        headers: {
            Accept: 'application/json',
        },
    };

    // post JSON
    var jsonData = {
        service: 'NEXTAPI',
        auth: auth,
    };

    rest.postJson('https://api.test.nordnet.se/next/2/login', jsonData, opts)
        .on('success', function(data, response) {
            // handle response
            util.puts('response: ' + util.inspect(data));
            fn(data, null);
        })
        .on('fail', function(data, resp) {
            util.log('fail: ' + util.inspect(data));
            fn(null, data);
        });
}

function subscribePrice(market, ident, sessionData) {
    var client = tls
        .connect(sessionData.private_feed.port, sessionData.public_feed.hostname, function() {
            client.setNoDelay(true);
            client.setTimeout(10000);

            util.log('Connected to feed');

            client.write(
                formatFeedCmd('login', {
                    session_key: sessionData.session_key,
                    service: 'NEXTAPI',
                }),

                function() {
                    client.write(
                        formatFeedCmd('subscribe', {
                            t: 'price',
                            i: ident,
                            m: market,
                        }),
                    );
                },
            );
        })
        .on('data', function(d) {
            util.log(d);
        });
}

function formatFeedCmd(cmd, args) {
    return (
        JSON.stringify({
            cmd: cmd,
            args: args,
        }) + '\n'
    );
}

var encryptStringWithRsaPublicKey = function(toEncrypt, relativeOrAbsolutePathToPublicKey) {
    var absolutePath = path.resolve(relativeOrAbsolutePathToPublicKey);
    var publicKey = fs.readFileSync(absolutePath, 'ascii');
    var key = new NodeRSA(publicKey, 'pkcs8-public-pem', {
        encryptionScheme: 'pkcs1',
    });
    var encrypted = key.encrypt(toEncrypt, 'base64');
    return encrypted;
};

function encryptLogin(user, pass, keyfile) {
    var auth = Buffer.from(user).toString('base64');
    auth += ':';
    auth += Buffer.from(pass).toString('base64');
    auth += ':';
    auth += Buffer.from('' + new Date().getTime()).toString('base64');
    var result = encryptStringWithRsaPublicKey(auth, keyfile);
    return result;
}

module.exports = {
    login,
    subscribePrice,
};
