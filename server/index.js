const express = require('express');
const enableWs = require('express-ws');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');
const os = require('os');
const jwt = require('express-jwt');
const jwtAuthz = require('express-jwt-authz');
const jwksRsa = require('jwks-rsa');
const yahoo = require('./yahoo');

const app = express();
const wsInstance = enableWs(app);
const wss = wsInstance.getWss();

let config = {
    dataFetchInterval: 11533,
    pingInterval: 31532,
};

let portfolio = undefined;

// Authentication middleware. When used, the
// Access Token must exist and be verified against
// the Auth0 JSON Web Key Set
const checkJwt = jwt({
    // Dynamically provide a signing key
    // based on the kid in the header and
    // the signing keys provided by the JWKS endpoint.
    secret: jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://bisand.auth0.com/.well-known/jwks.json`,
    }),

    // Validate the audience and the issuer.
    audience: 'https://allegutta.net/portfolio/api',
    issuer: 'https://bisand.auth0.com/',
    algorithms: ['RS256'],
});

function readConfigFile() {
    var configPath = path.resolve('./server.config.json');
    if (fs.existsSync(configPath)) {
        this.portfolio = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    }
}

// Fetch portfolio from Yahoo Finance.
async function fetchPortfolio() {
    const yahooApi = new yahoo.YahooApi();
    const portfolio = await yahooApi.get_portfolio();
    return portfolio;
}

async function loadPortfolioFromDisk(){
    let portfolio = {};
    let portfolioPath = path.resolve('./portfolio_allegutta.json');
    if (fs.existsSync(portfolioPath)) {
        portfolio = JSON.parse(fs.readFileSync(portfolioPath, 'utf-8'));
    }
    return portfolio;
}

// Publish portfolio to given client.
async function publishPortfolioToClient(client, portfolio) {
    try {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(portfolio));
        }
    } catch (error) {
        console.log(error);
    }
}

// Publish portfolio to all connected clients.
async function publishPortfolio(portfolio) {
    try {
        wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN && client.isAlive) {
                client.send(JSON.stringify(portfolio));
            }
        });
    } catch (error) {
        console.log(error);
    }
}

// Parse incoming messages and act accordingly.
async function parseMessage(msg, ws) {
    if ((msg && msg[0] === '{') || msg[0] === '[') {
        msg = JSON.parse(msg);
        if (msg.command && msg.command === 'start') {
            if (!portfolio) {
                portfolio = await fetchPortfolio();
            }
            publishPortfolioToClient(ws, portfolio);
        }
    }
    return msg;
}

// Empty function used in heartbeat.
function noop() {}

// Heartbeat function.
function heartbeat() {
    this.isAlive = true;
}

// Start by reading the config file.
readConfigFile();

// Options for serving static files via express.
var options = {
    dotfiles: 'ignore',
    extensions: ['htm', 'html', 'js', 'css'],
    maxAge: '1d',
    setHeaders: function(res, path, stat) {
        res.set('x-timestamp', Date.now());
    },
};

// Locate static files and serve them.
var dirName = path.join(__dirname, '/../public');
if (!fs.existsSync(dirName)) {
    dirName = path.join(__dirname, '/../client_dist');
}
app.use('/portfolio', express.static(dirName, options));

// Root path redirects to portfolio.
app.get('/', (req, res) => {
    res.redirect('/portfolio');
});

// WebSocket endpoint.
app.ws('/portfolio/ws', (ws, req) => {
    ws.isAlive = true;
    ws.on('pong', heartbeat);

    ws.on('message', async msg => {
        try {
            msg = await parseMessage(msg, ws);
            console.log(msg);
        } catch (error) {
            console.log(error);
        }
    });

    ws.on('close', async () => {
        console.log('WebSocket was closed');
    });
});

const scopeRead = jwtAuthz(['read:portfolio']);
const scopeFull = jwtAuthz(['read:portfolio', 'write:portfolio']);

app.get('/portfolio/api/test', (req, res) => {
    res.json({
        message: 'Hello from a public endpoint!',
    });
});

app.get('/portfolio/api/portfolio', checkJwt, async (req, res) => {
    const portfolio = await loadPortfolioFromDisk();
    res.json(portfolio);
});

app.post('/portfolio/api/portfolio', checkJwt, (req, res) => {});

// Regularly ping clients to make sure they are still alive.
const pingInterval = setInterval(function() {
    wss.clients.forEach(function each(ws) {
        if (ws.isAlive === false) {
            return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping(noop);
    });
}, config.pingInterval);

// Regularly publish portfolio to all connected clients.
const portfolioInterval = setInterval(async function() {
    portfolio = await fetchPortfolio();
    publishPortfolio(portfolio);
}, config.dataFetchInterval);

app.listen(4000);
