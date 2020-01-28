const express = require('express');
const enableWs = require('express-ws');
const path = require('path');
const fs = require('fs');
const os = require('os');
const sd = require('./stock-data');
const yahoo = require('./yahoo');

const app = express();
enableWs(app);

var config = { username: '', password: '' };
var timerHandle;

var configPath = path.resolve(os.homedir() + '/allegutta.config');
if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
}

async function fetchAndSendPortfolio(ws) {
    const yahooApi = new yahoo.YahooApi('', config);
    const portfolios = await yahooApi.get_portfolios();
    try {
        ws.send(JSON.stringify(portfolios));
    } catch (error) {
        console.log(error);
    }
}

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

app.use(express.static('public', options));

app.get('/', (req, res) => {
    res.redirect('/index.html');
});

app.ws('/ws', (ws, req) => {
    ws.on('message', async msg => {
        try {
            if ((msg && msg[0] === '{') || msg[0] === '[') {
                msg = JSON.parse(msg);
                if (msg.command && msg.command === 'start') {
                    await fetchAndSendPortfolio(ws);
                }
            }
            console.log(msg);
        } catch (error) {
            console.log(error);
        }
    });

    ws.on('open', async () => {
        console.log('WebSocket is open');
    });

    ws.on('close', async () => {
        clearInterval(timerHandle);
        console.log('WebSocket was closed');
    });

    async function intervalFunc() {
        await fetchAndSendPortfolio(ws);
    }

    timerHandle = setInterval(intervalFunc, 10000);
});

app.listen(3000);
