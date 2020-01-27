const path = require('path');
const fs = require('fs');
const got = require('got');
const queryString = require('query-string');

class YahooApi {
    constructor(userId, config) {
        this.config = config;
        this.userId = userId;
        this.portfolio_url = 'https://query1.finance.yahoo.com/v7/finance/desktop/portfolio';
        this.quotes_url = 'https://query2.finance.yahoo.com/v7/finance/quote';
    }

    //var req = unirest('GET', 'https://api.login.yahoo.com/oauth2/request_auth?client_id=dj0yJmk9bjR3Rm5OekRXdE81JmQ9WVdrOVVrUnVRVkJoTkdVbWNHbzlNQS0tJnM9Y29uc3VtZXJzZWNyZXQmc3Y9MCZ4PWYy&redirect_uri=oob&response_type=code&language=en-us');

    async get_portfolios() {
        var portfolioPath = path.resolve('./portfolio_allegutta.json');
        if (fs.existsSync(portfolioPath)) {
            this.portfolio = JSON.parse(fs.readFileSync(portfolioPath, 'utf-8'));
        }

        this.portfolio.purchase_value = 0.0;
        this.portfolio.market_value = 0.0;

        var tickers = '';
        this.portfolio.positions.forEach(element => {
            tickers += element.symbol + ',';
            this.portfolio.purchase_value += element.shares * element.avg_price;
        });
        tickers = tickers.substr(0, tickers.length - 1);
        // return this.portfolio;

        const searchParams = new URLSearchParams({
            formatted: false,
            lang: 'nb-NO',
            region: 'NO',
            symbols: tickers,
            fields: 'shortName,regularMarketPrice,regularMarketChange,regularMarketChangePercent,regularMarketVolume',
            corsDomain: 'finance.yahoo.com',
        });

        var quotes = await got(this.quotes_url, { searchParams })
            .then(res => {
                return JSON.parse(res.body).quoteResponse.result;
            })
            .catch(err => {
                console.log(err.response.body);
                return err.response.body;
            });

        quotes.forEach(element => {
            var symbol = element.symbol;
            var result = this.portfolio.positions.find(obj => {
                return obj.symbol === symbol;
            });
            if (result) {
                result.last_price = element.regularMarketPrice;
                this.portfolio.market_value += result.shares * element.regularMarketPrice;
            }
        });

        return this.portfolio;
    }
}
module.exports = {
    YahooApi,
};
