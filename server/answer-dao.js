'use strict';
/* Data Access Object (DAO) module for accessing Surveys */

const db = require('./db');

exports.getAnswers = (surveyId) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM answers WHERE surveyId=?';
        const params = [surveyId];

        db.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            const answers = rows.map( (e) => {
                const answers = JSON.parse(e.answers);
                return { userName: e.userName, answers: answers};
            });
            resolve(answers);
        });
    });
};


exports.addAnswer = (answer) => {
    return new Promise(async (resolve, reject) => {
        // non è necessario inserire l'id, si occuperà il db di aggiungerlo, incrementandolo sequenzialmente
        // tramite l'opzione AUTOINCREMENT
        const sql = 'INSERT INTO answers(surveyId, userName, answers) VALUES(?, ?, ?)';
        const params = [answer.surveyId, answer.userName, answer.answers];

        // l'incremento del nAnswers corrispondente alla risposta è gestito dal db mediante un trigger
        // altrimenti sarebbe stato necessario fare db.run dentro db.run che è brutto
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