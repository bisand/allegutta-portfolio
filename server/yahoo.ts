import got from 'got';
import path from 'path';
import fs from 'fs';
import { Portfolio } from './models/portfolio';

export class YahooApi {
    quotesUrl: string;
    portfolio: Portfolio;
    chartUrl: string;

    constructor() {
        this.portfolio = new Portfolio();
        this.quotesUrl = 'https://query2.finance.yahoo.com/v7/finance/quote';
        this.chartUrl = 'https://query1.finance.yahoo.com/v8/finance/chart/';
    }

    async get_portfolio(): Promise<Portfolio> {
        this.portfolio = new Portfolio();
        const portfolioPath = path.resolve('./data/portfolio_allegutta.json');
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

        let tickers = '';
        if (this.portfolio && this.portfolio.positions) {
            this.portfolio.positions.forEach(element => {
                tickers += element.symbol + ',';
                this.portfolio.cost_value += element.shares * element.avg_price;
            });
            tickers = tickers.substr(0, tickers.length - 1);
        }

        const searchParams: any = {
            formatted: false,
            lang: 'nb-NO',
            region: 'NO',
            symbols: tickers,
            fields:
                'shortName,longName,regularMarketChange,regularMarketChangePercent,regularMarketTime,regularMarketPrice,regularMarketDayHigh,regularMarketDayRange,regularMarketDayLow,regularMarketVolume,regularMarketPreviousClose',
            corsDomain: 'finance.yahoo.com',
        };

        const quotes = await got(this.quotesUrl, { searchParams })
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
            const currentDay = new Date().getDate();
            let newDay: boolean = false;
            quotes.forEach((element: { symbol: any; regularMarketTime: number; longName: string; regularMarketPrice: number; regularMarketChange: number; regularMarketChangePercent: number; regularMarketPreviousClose: number; regularMarketDayHigh: number; regularMarketDayLow: number; }) => {
                const symbol = element.symbol;
                const symbolDate = new Date(element.regularMarketTime * 1000);
                const symbolDay = symbolDate.getDate();
                if (currentDay === symbolDay) {
                    newDay = true;
                }
                const result = this.portfolio.positions.find(obj => {
                    return obj.symbol === symbol;
                });
                if (result) {
                    result.name = element.longName;
                    result.last_price = element.regularMarketPrice;
                    result.change_today = currentDay === symbolDay ? element.regularMarketChange : 0.0;
                    result.change_today_percent = currentDay === symbolDay ? element.regularMarketChangePercent : 0.0;
                    result.prev_close = element.regularMarketPreviousClose;
                    result.cost_value = result.avg_price * result.shares;
                    result.current_value = result.last_price * result.shares;
                    result.return = result.current_value - result.cost_value;
                    if (result.cost_value && result.cost_value !== 0) {
                        result.return_percent = (result.return / result.cost_value) * 100;
                    } else {
                        result.return_percent = 0;
                    }

                    this.portfolio.market_value += result.shares * element.regularMarketPrice;
                    this.portfolio.market_value_prev += result.shares * element.regularMarketPreviousClose;
                    this.portfolio.market_value_max += result.shares * element.regularMarketDayHigh;
                    this.portfolio.market_value_min += result.shares * element.regularMarketDayLow;
                    this.portfolio.change_today_total += currentDay === symbolDay ? result.shares * element.regularMarketChange : 0.0;
                }
                this.portfolio.equity = this.portfolio.market_value + this.portfolio.cash;
                this.portfolio.change_today_percent = (this.portfolio.change_today_total / this.portfolio.market_value_prev) * 100;
                this.portfolio.change_total = this.portfolio.market_value - this.portfolio.cost_value;
                this.portfolio.change_total_percent = (this.portfolio.change_total / this.portfolio.cost_value) * 100;

                if (!newDay) {
                    this.portfolio.change_today_total = 0.0;
                    this.portfolio.change_today_percent = 0.0;
                }
            });
        }

        return this.portfolio;
    }

    async getChartData(symbol: string, range: string, interval: string): Promise<object> {
        const searchParams = { symbol, range, interval, region: 'NO', lang: 'nb-NO', includePrePost: false, events: 'div|split|earn' };

        const chart = await got(this.chartUrl, { searchParams })
            .then(res => {
                if (res) {
                    return JSON.parse(res.body).chart.result;
                }
            })
            .catch(err => {
                if (err && err.response) {
                    console.log(err.response.body);
                    return err.response.body;
                }
            });

        if (chart && chart.length > 0) {
            return chart[0];
        }

        return {};
    }

    savePortfolio(portfolio: Portfolio) {
        if (!portfolio) return;

        const portfolioPath = path.resolve('./data/portfolio_allegutta.json');
        const backupPortfolioPath = path.resolve('./data/portfolio_allegutta_backup_' + new Date().valueOf() + '.json');
        fs.copyFileSync(portfolioPath, backupPortfolioPath);
        fs.writeFileSync(portfolioPath, JSON.stringify(portfolio));
        this.portfolio = portfolio;
        return portfolio;
    }
}
module.exports = {
    YahooApi,
};
