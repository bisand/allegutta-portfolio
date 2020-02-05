import sqlite3 from 'sqlite3po';
import { Portfolio } from './models/portfolio';
import { PortfolioPosition } from './models/position';

export class DataRepository {
    _databaseFile: string;
    constructor(databaseFile: string) {
        this._databaseFile = databaseFile;
    }

    open() {
        const db = new sqlite3.Database(this._databaseFile, err => {
            if (err) {
                console.error(err.message);
            }
            console.log('Connected to the database.');
        });
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
        const db = this.open();
        const result = (await db
            .allAsync(
                `
                SELECT p.id, p.name, p.cash, pp.id [pos_id], pp.symbol, pp.shares, pp.avg_price FROM portfolio p 
                LEFT JOIN portfolio_positions pp ON p.id = pp.portfolio_id 
                WHERE p.name = $name`,
                { $name: portfolioName },
            )
            .then((res: any) => {
                let p = new Portfolio();
                res.forEach((pos: any) => {
                    if (!p.name) {
                        p.name = pos.name;
                        p.cash = pos.cash;
                        p.id = pos.id;
                    }
                    const pp = new PortfolioPosition();
                    pp.id = pos.pos_id;
                    pp.symbol = pos.symbol;
                    pp.shares = pos.shares;
                    pp.avg_price = pos.avg_price;
                    p.positions.push(pp);
                });
                return p;
            })) as Portfolio;
        return result;
    }

    async importPortfolioAsync(portfolio: Portfolio): Promise<void> {
        const db = this.open();
        const lastId = await db
            .runAsync(`INSERT INTO portfolio(name, cash) VALUES($name, $cash)`, {
                $name: portfolio.name,
                $cash: portfolio.cash,
            })
            .then((res: any) => {
                return res.lastID;
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
        this.close(db);
    }

    async initAsync() {
        const db = this.open();
        await db.runAsync(`CREATE TABLE IF NOT EXISTS "portfolio" (
            "id"	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
            "name"	TEXT,
            "cash"	REAL NOT NULL DEFAULT 0.0
        );`);
        await db.runAsync(`CREATE TABLE IF NOT EXISTS "portfolio_positions" (
            "id"	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
            "portfolio_id"	INTEGER NOT NULL,
            "symbol"	TEXT NOT NULL,
            "shares"	INTEGER NOT NULL  DEFAULT 0,
            "avg_price"	REAL NOT NULL DEFAULT 0.0,
            FOREIGN KEY("portfolio_id") REFERENCES "portfolio"("id")
        );`);
        this.close(db);
    }
}
module.exports = {
    DataRepository,
};
