const express = require('express');
const enableWs = require('express-ws');
const path = require('path');
const fs = require('fs');
const os = require("os");
const sd = require('./stock-data');

const app = express();
enableWs(app);

var config = { username: '', password: '' };

var configPath = path.resolve(os.homedir() + '/allegutta.config');
if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
}

var options = {
    dotfiles: 'ignore',
    etag: false,
    extensions: ['htm', 'html', 'js', 'css'],
    index: false,
    maxAge: '1d',
    redirect: false,
    setHeaders: function (res, path, stat) {
        res.set('x-timestamp', Date.now());
    },
};

app.use(express.static('public', options));

app.get('/', (req, res) => {
    res.redirect('/index.html');
});

app.ws('/echo', (ws, req) => {
    ws.on('message', msg => {
        ws.send(msg);
    });

    ws.on('open', () => {
        console.log('WebSocket is open');
    });

    ws.on('close', () => {
        console.log('WebSocket was closed');
    });

    sd.login(config.username, config.password, function (sessionData, error) {
        if (!error) {
            sd.subscribePrice(15, '16386676', sessionData, (data) => {
                if (ws.readyState === 1) {
                    ws.send(data);
                }
            });
        }
    });

    function intervalFunc() {
        ws.send('Time on server is: ' + Date.now());
    }

    setInterval(intervalFunc, 1500);
});

app.listen(8080);
