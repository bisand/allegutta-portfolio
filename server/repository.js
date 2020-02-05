const sqlite3 = require('sqlite3').verbose();

class DataRepository {
    constructor(databaseFile) {
        this._databaseFile = databaseFile;
    }

    open() {
        let db = new sqlite3.Database(this._databaseFile, err => {
            if (err) {
                console.error(err.message);
            }
            console.log('Connected to the chinook database.');
        });
        return db;
    }

    close(db) {
        db.close(err => {
            if (err) {
                console.error(err.message);
            }
            console.log('Close the database connection.');
        });
    }

    init(params) {
        let db = this.open();
        db.run(`CREATE TABLE IF NOT EXISTS "portfolio" (
            "id"	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
            "name"	TEXT,
            "cash"	NUMERIC NOT NULL
        );`);
        db.run(`CREATE TABLE IF NOT EXISTS "portfolio_positions" (
            "id"	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
            "portfolio_id"	INTEGER NOT NULL,
            "symbol"	TEXT NOT NULL,
            "shares"	INTEGER NOT NULL,
            "avg_price"	NUMERIC NOT NULL,
            FOREIGN KEY("portfolio_id") REFERENCES "portfolio"("id")
        );`);
        this.close(db);
    }
}
module.exports = {
    DataRepository,
};
