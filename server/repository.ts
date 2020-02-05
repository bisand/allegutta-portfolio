import sqlite3 from 'sqlite3po';
import { Portfolio } from './models/portfolio';

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

    async getPortfolio(portfolioName: string): Promise<Portfolio> {
        const db = this.open();
        const result = await db
            .allAsync('select p.id, p.name, p.cash from portfolio p left join portfolio_positions pp on p.id = pp.portfolio_id where p.name = $name', { $name: portfolioName })
            .then((err:any, res: any) => {
                let p = new Portfolio();
                return p;
            });
        return result;
    }

    init() {
        const db = this.open();
        db.run(`CREATE TABLE IF NOT EXISTS "portfolio" (
            "id"	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
            "name"	TEXT,
            "cash"	REAL NOT NULL DEFAULT 0.0
        );`);
        db.run(`CREATE TABLE IF NOT EXISTS "portfolio_positions" (
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
