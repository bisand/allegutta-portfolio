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

    init(params) {
        let db = this.open();
        db.run('CREATE TABLE langs(name text)');
        this.close(db)
    }

    close(db) {
        db.close((err) => {
            if (err) {
              console.error(err.message);
            }
            console.log('Close the database connection.');
          });
    };
}
module.exports = {
    DataRepository,
};
