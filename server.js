const express = require('express');
const enableWs = require('express-ws');
const sd = require('./stock-data');
var path = require('path');
var mime = require('mime');

const app = express();
enableWs(app);

var options = {
    dotfiles: 'ignore',
    etag: false,
    extensions: ['htm', 'html', 'js', 'css'],
    index: false,
    maxAge: '1d',
    redirect: false,
    setHeaders: function(res, path, stat) {
        res.set('x-timestamp', Date.now());
    },
};

var username = ''; // Get from config.
var password = ''; // Get from config.

sd.login(username, password, function(sessionData, error) {
    if (!error) {
        sd.subscribePrice(30, '1869', sessionData);
    }
});

app.use(express.static('public', options));

app.get('/', (req, res) => {
    res.redirect('/index.html');
});

app.ws('/echo', (ws, req) => {
    ws.on('message', msg => {
        ws.send(msg);
    });

    ws.on('close', () => {
        console.log('WebSocket was closed');
    });

    function intervalFunc() {
        ws.send('Time on server is: ' + Date.now());
    }

    setInterval(intervalFunc, 1500);
});

app.listen(8080);
