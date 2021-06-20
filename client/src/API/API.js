async function logIn(credentials) {
    let response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
    });

    if (response.ok) {
        const user = await response.json();
        return user.name;
    }
    else {
        try {
            const errDetail = await response.json();
            throw errDetail.message;
        }
        catch (err) {
            throw err;
        }
    }
}

async function logOut() {
    await fetch('/api/sessions/current', { method: 'DELETE' });
}

async function getAdminInfo() {
    const response = await fetch('/api/sessions/current');
    const userInfo = await response.json();
    if (response.ok) {
        return userInfo;
    } else {
        throw userInfo;  // an object with the error coming from the server
    }
}

async function getSurveys() {
    const response = await fetch(`/api/surveys`);
    const surveys = await response.json();

    if (surveys.error) {
        throw surveys.error;
    }

    if (response.ok) {
        return surveys;
    } else {
        throw surveys;  // An object with the error coming from the server
    }
}

async function getAnswers(surveyId) {
    const response = await fetch(`/api/surveys/${surveyId}/answers`);
    const answers = await response.json();

    if (answers.error) {
        throw answers.error;
    }

    if (response.ok) {
        return answers;
    } else {
        throw answers;  // An object with the error coming from the server
    }
}

function addSurvey(survey) {
    return new Promise((resolve, reject) => {
        fetch('api/surveys', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({...survey, questions: JSON.stringify(survey.questions)}),
        }).then((response) => {
            if (response.ok) {
                resolve(null);
            } else {
                // analyze the cause of error
                response.json()
                    .then((obj) => { reject(obj); }) // error msg in the response body
                    .catch((err) => { reject({ errors: [{ param: "Application", msg: "Cannot parse server response" }] }) }); // something else
            }
        }).catch((err) => { reject({ errors: [{ param: "Server", msg: "Cannot communicate" }] }) }); // connection errors
    });
}

function addAnswer(answer) {
    return new Promise((resolve, reject) => {
        fetch('api/answers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({...answer, answers: JSON.stringify(answer.answers)}),
        }).then((response) => {
            if (response.ok) {
                resolve(null);
            } else {
                // analyze the cause of error
                response.json()
                    .then((obj) => { reject(obj); }) // error msg in the response body
                    .catch((err) => { reject({ errors: [{ param: "Application", msg: "Cannot parse server response" }] }) }); // something else
            }
        }).catch((err) => { reject({ errors: [{ param: "Server", msg: "Cannot communicate" }] }) }); // connection errors
    });
}

function deleteSurvey(surveyId) {
  return new Promise((resolve, reject) => {
    fetch('/api/surveys/' + surveyId, {
      method: 'DELETE',
    }).then((response) => {
      if (response.ok) {
        resolve(null);
      } else {
        // analyze the cause of error
        response.json()
          .then((obj) => { reject(obj); }) // error msg in the response body
          .catch((err) => { reject({ errors: [{ param: "Application", msg: "Cannot parse server response" }] }) }); // something else
      }
    }).catch((err) => { reject({ errors: [{ param: "Server", msg: "Cannot communicate" }] }) }); // connection errors
  });
}

const API = { logIn, logOut, getAdminInfo, getSurveys, addSurvey, getAnswers, addAnswer, deleteSurvey };
export default API;