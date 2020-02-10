import express from 'express';
import expressWs from 'express-ws';
import bodyParser from 'body-parser';
import WebSocket from 'ws';
import path from 'path';
import fs from 'fs';
import os from 'os';
import jwt from 'express-jwt';
import jwtAuthz from 'express-jwt-authz';
import jwksRsa from 'jwks-rsa';
import { YahooApi } from './yahoo';
import { DataRepository } from './repository';
import { Portfolio } from './models/portfolio';

interface ExtWebSocket extends WebSocket {
    isAlive: boolean;
}

const appBase = express();
const wsInstance = expressWs(appBase);
const wss = wsInstance.getWss();
const { app } = wsInstance;

let config = {
    dataFetchInterval: 11533,
    pingInterval: 31532,
};

let portfolio: Portfolio;

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
    const configPath = path.resolve('./config/server.config.json');
    if (fs.existsSync(configPath)) {
        config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    }
}

// Fetch portfolio from Yahoo Finance.
async function fetchPortfolio(): Promise<Portfolio> {
    const yahooApi = new YahooApi();
    const portfolio: Portfolio = await yahooApi.get_portfolio();
    return portfolio;
}

async function loadPortfolioFromDisk(): Promise<Portfolio> {
    const portfolio: Portfolio = new Portfolio();
    const portfolioPath = path.resolve('./data/portfolio_allegutta.json');
    if (fs.existsSync(portfolioPath)) {
        Object.assign(portfolio, JSON.parse(fs.readFileSync(portfolioPath, 'utf-8')) as Portfolio);
    }
    if (!portfolio.name) {
        portfolio.name = '';
    }
    return portfolio;
}

async function archivePortfolioFiles(): Promise<Portfolio> {
    const portfolio: Portfolio = new Portfolio();
    const portfolioPath = path.resolve('./data/portfolio_allegutta.json');
    if (fs.existsSync(portfolioPath)) {
        Object.assign(portfolio, JSON.parse(fs.readFileSync(portfolioPath, 'utf-8')) as Portfolio);
    }
    if (!portfolio.name) {
        portfolio.name = '';
    }
    return portfolio;
}

// Publish portfolio to given client.
async function publishPortfolioToClient(client: WebSocket, portfolio: Portfolio) {
    try {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(portfolio));
        }
    } catch (error) {
        console.log(error);
    }
}

// Publish portfolio to all connected clients.
async function publishPortfolio(portfolio: Portfolio) {
    try {
        wss.clients.forEach(function each(ws) {
            const extWs = ws as ExtWebSocket;
            if (extWs.readyState === WebSocket.OPEN && extWs.isAlive) {
                extWs.send(JSON.stringify(portfolio));
            }
        });
    } catch (error) {
        console.log(error);
    }
}

// Parse incoming messages and act accordingly.
async function parseMessage(msg: any, ws: ExtWebSocket) {
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
// tslint:disable-next-line: no-empty
function noop() {}

// Heartbeat function.
function heartbeat() {
    this.isAlive = true;
}

// Start by reading the config file.
readConfigFile();

// Options for serving static files via express.
const options: any = {
    dotfiles: 'ignore',
    extensions: ['htm', 'html', 'js', 'css', 'png', 'ico', 'gif'],
    maxAge: '1d',
    setHeaders(res) {
        res.set('x-timestamp', Date.now());
    },
};

// Locate static files and serve them.
let dirName = path.join(__dirname, '/../public');
if (!fs.existsSync(dirName)) {
    dirName = path.join(__dirname, '/../client_dist');
}
app.use('/portfolio', express.static(dirName, options));
app.use(bodyParser.json());

// Root path redirects to portfolio.
app.get('/', (req, res) => {
    res.redirect('/portfolio');
});

// WebSocket endpoint.
app.ws('/portfolio/ws', (ws: WebSocket, req: any) => {
    const extWs = ws as ExtWebSocket;
    extWs.isAlive = true;
    extWs.on('pong', heartbeat);

    extWs.on('message', async msg => {
        try {
            msg = await parseMessage(msg, extWs);
            console.log(msg);
        } catch (error) {
            console.log(error);
        }
    });

    extWs.on('close', async () => {
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
    const result = await loadPortfolioFromDisk();
    res.json(result);
});

app.post('/portfolio/api/portfolio', checkJwt, (req, res) => {
    console.log(req.body);
    portfolio = req.body;
    const yahooApi = new YahooApi();
    yahooApi.savePortfolio(portfolio);
});

// Regularly ping clients to make sure they are still alive.
const pingInterval = setInterval(() => {
    wss.clients.forEach(function each(ws) {
        const extWs = ws as ExtWebSocket;
        if (extWs.isAlive === false) {
            return extWs.terminate();
        }
        extWs.isAlive = false;
        extWs.ping(noop);
    });
}, config.pingInterval);

// Regularly publish portfolio to all connected clients.
const portfolioInterval = setInterval(async () => {
    portfolio = await fetchPortfolio();
    publishPortfolio(portfolio);
}, config.dataFetchInterval);

// const repo = new DataRepository('./data/allegutta.db');
// loadPortfolioFromDisk().then(async portfolio => {
//    await repo.initAsync();
//    await repo.importPortfolioAsync(portfolio);
//    const data = await repo.getPortfolioAsync('AlleGutta').catch(err => {
//        console.log(err);
//    });
// });

app.listen(4000);
