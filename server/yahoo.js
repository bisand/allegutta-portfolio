const path = require('path');
const fs = require('fs');
const got = require('got');
const queryString = require('query-string');

class YahooApi {
    constructor() {
        this.quotes_url = 'https://query2.finance.yahoo.com/v7/finance/quote';
    }

    async get_portfolio() {
        this.portfolio = {};
        var portfolioPath = path.resolve('./portfolio_allegutta.json');
        if (fs.existsSync(portfolioPath)) {
            this.portfolio = JSON.parse(fs.readFileSync(portfolioPath, 'utf-8'));
        }

        this.portfolio.equity = 0.0;
        this.portfolio.cost_value = 0.0;
        this.portfolio.market_value = 0.0;
        this.portfolio.market_value_prev = 0.0;
        this.portfolio.market_value_max = 0.0;
        this.portfolio.market_value_min = 0.0;
        this.portfolio.change_today_total = 0.0;
        this.portfolio.change_today_percent = 0.0;

        var tickers = '';
        if (this.portfolio && this.portfolio.positions) {
            this.portfolio.positions.forEach(element => {
                tickers += element.symbol + ',';
                this.portfolio.cost_value += element.shares * element.avg_price;
            });
            tickers = tickers.substr(0, tickers.length - 1);
        }

        const searchParams = new URLSearchParams({
            formatted: false,
            lang: 'nb-NO',
            region: 'NO',
            symbols: tickers,
            fields:
                'shortName,longName,regularMarketChange,regularMarketChangePercent,regularMarketTime,regularMarketPrice,regularMarketDayHigh,regularMarketDayRange,regularMarketDayLow,regularMarketVolume,regularMarketPreviousClose',
            corsDomain: 'finance.yahoo.com',
        });

        var quotes = await got(this.quotes_url, { searchParams })
            .then(res => {
                if (res) {
                    return JSON.parse(res.body).quoteResponse.result;
                }
            })
            .catch(err => {
                if (err && err.response) {
                    console.log(err.response.body);
                    return err.response.body;
                }
            });

        if (quotes) {
            quotes.forEach(element => {
                var symbol = element.symbol;
                var result = this.portfolio.positions.find(obj => {
                    return obj.symbol === symbol;
                });
                if (result) {
                    result.name = element.longName;
                    result.last_price = element.regularMarketPrice;
                    result.change_today = element.regularMarketChange;
                    result.change_today_percent = element.regularMarketChangePercent;
                    result.prev_close = element.regularMarketPreviousClose;
                    result.cost_value = result.avg_price * result.shares;
                    result.current_value = result.last_price * result.shares;
                    result.return = result.current_value - result.cost_value;
                    if (result.cost_value && result.cost_value !== 0) {
                        result.return_percent = (result.return / result.cost_value) * 100;
                    } else {
                        result.return_percent;
                    }

                    this.portfolio.market_value += result.shares * element.regularMarketPrice;
                    this.portfolio.market_value_prev += result.shares * element.regularMarketPreviousClose;
                    this.portfolio.market_value_max += result.shares * element.regularMarketDayHigh;
                    this.portfolio.market_value_min += result.shares * element.regularMarketDayLow;
                    this.portfolio.change_today_total += result.shares * element.regularMarketChange;
                }
                this.portfolio.equity = this.portfolio.market_value + this.portfolio.cash;
                this.portfolio.change_today_percent = (this.portfolio.change_today_total / this.portfolio.market_value_prev) * 100;
                this.portfolio.change_total = this.portfolio.market_value - this.portfolio.cost_value;
                this.portfolio.change_total_percent = (this.portfolio.change_total / this.portfolio.cost_value) * 100;
            });
        }

        return this.portfolio;
    }

    savePortfolio(portfolio) {

        if (!portfolio)
            return;

        var portfolioPath = path.resolve('./portfolio_allegutta.json');
        var backupPortfolioPath = path.resolve('./portfolio_allegutta_backup_' + new Date().valueOf() + '.json');
        fs.copyFileSync(portfolioPath, backupPortfolioPath);
        fs.writeFileSync(portfolioPath, JSON.stringify(portfolio))
        this.portfolio = portfolio;
        return portfolio;
    }
}
module.exports = {
    YahooApi,
};
