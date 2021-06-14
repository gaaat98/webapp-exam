'use strict'

const express = require('express');
const morgan = require('morgan'); // logging middleware
const { query, validationResult, check, body } = require('express-validator'); // validation middleware

const passport = require('passport'); // auth middleware
const LocalStrategy = require('passport-local').Strategy; // username and password for login
const session = require('express-session'); // enable sessions

const surveyDao = require('./survey-dao');      // module for accessing the surveys in the DB
const adminDao = require('./admin-dao');        // module for accessing the admins in the DB
const answerDao = require('./answer-dao');      // module for accessing the answers in the DB

/*** Set up Passport ***/
// set up the "username and password" login strategy
// by setting a function to verify username and password
passport.use(new LocalStrategy(
    function(username, password, done) {
      adminDao.getAdmin(username, password).then((user) => {
        if (!user)
          return done(null, false, { message: 'Incorrect username and/or password.' });

        return done(null, user);
      })
    }
  ));

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  // starting from the data in the session, we extract the current (logged-in) user
  passport.deserializeUser((id, done) => {
    adminDao.getAdminById(id)
      .then(user => {
        done(null, user); // this will be available in req.user
      }).catch(err => {
        done(err, null);
      });
  });


// init express
const app = express();
const PORT = 3001;

// set-up the middlewares
app.use(morgan('dev'));
app.use(express.json());

const isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated())
      return next();
    
    return res.status(401).json({ error: 'not authenticated'});
  }
  
  // set up the session
  app.use(session({
    // by default, Passport uses a MemoryStore to keep track of the sessions
    secret: 'a secret sentence not to share with anybody and anywhere, used to sign the session ID cookie',
    resave: false,
    saveUninitialized: false 
  }));
  
  // then, init passport
  app.use(passport.initialize());
  app.use(passport.session());

 
/*** API ***/
/*
retrieve:
    GET /api/surveys
    GET /api/surveys/:id/answers

create:
    POST /api/surveys
    POST /api/surveys/:id/answers
*/

// POST /sessions 
// login
app.post('/api/sessions', function(req, res, next) {
    passport.authenticate('local', (err, user, info) => {
      if (err)
        return next(err);
        if (!user) {
          // display wrong login messages
          return res.status(401).json(info);
        }
        // success, perform the login
        req.login(user, (err) => {
          if (err)
            return next(err);
          
          // req.user contains the authenticated user, we send all the user info back
          // this is coming from userDao.getUser()
          return res.json(req.user);
        });
    })(req, res, next);
  });

// DELETE /sessions/current 
// logout
app.delete('/api/sessions/current', (req, res) => {
    req.logout();
    res.end();
  });
  
  // GET /sessions/current
  // check whether the user is logged in or not
app.get('/api/sessions/current', (req, res) => {
    if(req.isAuthenticated()) {
      res.status(200).json(req.user);}
    else
      res.status(401).json({error: 'Unauthenticated user!'});;
});

app.get('/api/surveys', 
    async (req, res) => {
        try {
            if (req.isAuthenticated()) {
                // only admin's surveys
                const surveys = await surveyDao.getSurveys(req.user.id);
                res.status(200).json(surveys);
            } else {
                // all the surveys for general user
                const surveys = await surveyDao.getSurveys();
                res.status(200).json(surveys);
            }
        } catch (err) {
            res.status(500).json({ 'error': err });
        }
    });

// non necessario, ma lasciato per consistenza
app.get('/api/surveys/:id', [
    check('id', 'id must be an integer').isInt()
], async (req, res) => {
    try {
        // input sanitization
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() })
        }

        const survey = await surveyDao.getSurvey(req.params.id);
        res.status(200).json(survey);
    } catch (err) {
        res.status(500).json({ 'error': err });
    }
});

app.get('/api/surveys/:id/answers', [
    check('id', 'id must be an integer').isInt()
], async (req, res) => {
    try {
        // input sanitization
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() })
        }

        const answers = await answerDao.getAnswers(req.params.id);
        res.status(200).json(answers);
    } catch (err) {
        res.status(500).json({ 'error': err });
    }
});

/*
example of POST /api/tasks (p.s. setup content-type: application/json)
{"private":1,
"taskName":"prova2",
"date":"2021-05-21",
"completed":0,
"user":1 ,
"important":1}

body('taskName', 'taskName length must be 1-200 chars').isLength({ min: 1, max: 200 }),
    body('private', 'private is a boolean attribute').isBoolean(),
    body('date', 'date must be a valid date').isDate(),
    body('completed', 'completed is a boolean attributes').isBoolean(),
    body('important', 'important is a boolean attribute').isBoolean()
*/
app.post('/api/answers', [], async (req, res) => {
    try {
        // input sanitization
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() })
        }

        const answer = {
            surveyId: req.body.surveyId,
            userName: req.body.userName,
            answers: req.body.answers
        }

        const answerId = await answerDao.addAnswer(answer);
        res.status(200).json({ 'msg': `Added answer with id: ${answerId}.` });
    } catch (err) {
        res.status(500).json({ 'error': err });
    }
});

app.post('/api/surveys', [], isLoggedIn, async (req, res) => {
    try {
        // input sanitization
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() })
        }

        const survey = {
            admin: req.user.id,
            title: req.body.title,
            questions: req.body.questions
        }

        const surveyId = await surveyDao.addSurvey(survey);
        res.status(200).json({ 'msg': `Added survey with id: ${surveyId}.` });
    } catch (err) {
        res.status(500).json({ 'error': err });
    }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}/`));