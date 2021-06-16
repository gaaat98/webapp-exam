'use strict';
/* Data Access Object (DAO) module for accessing Surveys */

const db = require('./db');

exports.getSurveys = (userId) => {
    return new Promise((resolve, reject) => {
        const sql = (userId === undefined) ? 'SELECT * FROM surveys' : 'SELECT * FROM surveys WHERE admin=?';
        const params = (userId === undefined) ? [] : [userId];

        db.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            const surveys = rows.map( (e) => {
                const questions = JSON.parse(e.questions);
                return { id: e.id, nAnswers: e.nAnswers, title: e.title, questions: questions};
            });
            resolve(surveys);
        });
    });
};

// get the Survey identified by {id}
exports.getSurvey = (surveyId) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM surveys WHERE id=?';
        const params = [surveyId];

        db.get(sql, params, (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            if (row == undefined) {
                resolve({ error: `Survey ${surveyId} not found.`});
            }else{
                const questions = JSON.parse(row.questions);
                const survey = { id: row.id, nAnswers: row.nAnswers, title: row.title, questions: questions};
                resolve(survey);
            }
        });
    });
};

exports.addSurvey = (survey) => {
    return new Promise(async (resolve, reject) => {
        // non è necessario inserire l'id, si occuperà il db di aggiungerlo, incrementandolo sequenzialmente
        // tramite l'opzione AUTOINCREMENT
        const sql = 'INSERT INTO surveys(admin, title, questions) VALUES(?, ?, ?)';
        const params = [survey.admin, survey.title, survey.questions];

        db.run(sql, params, function (err) {
            if (err) {
                reject(err);
                return;
            }

            // ritorna l'id del questionario
            resolve(this.lastID);
            return;
        });
    });
};

// delete an existing survey of the user
// non è necessario eliminare anche le risposte perchè se ne occupano le regole del db
exports.deleteSurvey = (id, userId) => {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM surveys WHERE id = ? AND admin = ?';
        db.run(sql, [id, userId], function (err) {
            if (err) {
                reject(err);
                return;
            } else
                resolve(this.changes); // return num of rows affected by the query
        });
    });
}