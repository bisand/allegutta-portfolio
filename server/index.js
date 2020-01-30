const express = require('express');
const enableWs = require('express-ws');
const path = require('path');
const fs = require('fs');
const os = require('os');
const sd = require('./stock-data');
const yahoo = require('./yahoo');

const app = express();
enableWs(app);

var timerHandle;

async function fetchAndSendPortfolio(ws) {
    const yahooApi = new yahoo.YahooApi();
    const portfolios = await yahooApi.get_portfolios();
    try {
        ws.send(JSON.stringify(portfolios));
    } catch (error) {
        console.log(error);
    }
}

var options = {
    dotfiles: 'ignore',
    extensions: ['htm', 'html', 'js', 'css'],
    maxAge: '1d',
    setHeaders: function(res, path, stat) {
        res.set('x-timestamp', Date.now());
    },
};

var dirName = path.join(__dirname, '/../public');
if (!fs.existsSync(dirName)) {
    dirName = path.join(__dirname, '/../client_dist');
}
app.use('/portfolio', express.static(dirName, options));

app.get('/', (req, res) => {
    res.redirect('/portfolio');
});

app.ws('/portfolio/ws', (ws, req) => {
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
        try {
            await fetchAndSendPortfolio(ws);
        } catch (error) {
            console.error(error);
        }
    }

    timerHandle = setInterval(intervalFunc, 10000);
});

app.listen(4000);
