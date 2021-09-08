import sqlite3 from 'sqlite3';
import { Portfolio } from './models/portfolio';
import { PortfolioPosition } from './models/position';
import { open } from 'sqlite';

export class DataRepository {
    _databaseFile: string;
    constructor(databaseFile: string) {
        this._databaseFile = databaseFile;
    }

    async open() {
        const db = await open({ filename: this._databaseFile, driver: sqlite3.Database });
        return db;
    }

    close(db: sqlite3.Database) {
        db.close(err => {
            if (err) {
                console.error(err.message);
            }
            console.log('Closed the database connection.');
        });
    }

    async getPortfolioAsync(portfolioName: string): Promise<Portfolio> {
        const db = await this.open();
        const positions = await db.all<PortfolioPosition[]>(
            `
                SELECT p.id, p.name, p.cash, pp.id [pos_id], pp.symbol, pp.shares, pp.avg_price FROM portfolio p 
                LEFT JOIN portfolio_positions pp ON p.id = pp.portfolio_id 
                WHERE p.name = $name`,
            { $name: portfolioName });
        let portfolio = new Portfolio();
        positions.forEach((pos: any) => {
            if (!portfolio.name) {
                portfolio.name = pos.name;
                portfolio.cash = pos.cash;
                portfolio.id = pos.id;
            }
            const pp = new PortfolioPosition();
            pp.id = pos.pos_id;
            pp.symbol = pos.symbol;
            pp.shares = pos.shares;
            pp.avg_price = pos.avg_price;
            portfolio.positions.push(pp);
        });
        return portfolio;
    }

    async importPortfolioAsync(portfolio: Portfolio): Promise<void> {
        const db = await this.open();
        const lastId = await db
            .run(`INSERT INTO portfolio(name, cash) VALUES($name, $cash)`, {
                $name: portfolio.name,
                $cash: portfolio.cash,
                // })
                // .then((res: any) => {
                //     return res.lastID;
            });
        portfolio.positions.forEach(position => {
            db.run(
                `INSERT INTO portfolio_positions(portfolio_id, symbol, shares, avg_price) VALUES($portfolio_id, $symbol, $shares, $avg_price)`,
                {
                    $portfolio_id: lastId,
                    $symbol: position.symbol,
                    $shares: position.shares,
                    $avg_price: position.avg_price,
                },
                (err: any) => {
                    if (err) console.error(err);
                },
            );
        });
        await db.close();
    }

    async initAsync() {
        const db = await this.open();
        await db.run(`CREATE TABLE IF NOT EXISTS "portfolio" (
            "id"	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
            "name"	TEXT,
            "cash"	REAL NOT NULL DEFAULT 0.0
        );`);
        await db.run(`CREATE TABLE IF NOT EXISTS "portfolio_positions" (
            "id"	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
            "portfolio_id"	INTEGER NOT NULL,
            "symbol"	TEXT NOT NULL,
            "shares"	INTEGER NOT NULL  DEFAULT 0,
            "avg_price"	REAL NOT NULL DEFAULT 0.0,
            FOREIGN KEY("portfolio_id") REFERENCES "portfolio"("id")
        );`);
        await db.close();
    }
}
module.exports = {
    DataRepository,
};
