'use strict'

const sqlite = require('sqlite3');

// open the database
const db = new sqlite.Database('SurveyMaster.db', (err) => {
    if (err) throw err;
});

// per abilitare ON DELETE CASCADE sulla foreign key delle answers
db.get("PRAGMA foreign_keys = ON");

module.exports = db;