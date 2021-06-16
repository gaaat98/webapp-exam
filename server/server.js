'use strict'

const express = require('express');
const morgan = require('morgan'); // logging middleware
const { validationResult, check, body } = require('express-validator'); // validation middleware

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
    GET /api/surveys/:id/
    GET /api/surveys/:id/answers

create:
    POST /api/surveys
    POST /api/answers
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
            res.status(500).json({ error: err });
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
        res.status(500).json({ error: err });
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
        res.status(500).json({ error: err });
    }
});

const validateQuestions = (req, res, next) => {
  const questions = JSON.parse(req.body.questions);

  if(questions.length === 0)
      return res.status(422).json({ error: `Survey must contain at least one question.`});

  let invalid = 0;
  for(let i = 0; i < questions.length; i++){
    const q = questions[i];

    if(q === undefined){
      console.log("q undef");
      invalid++;
      continue;
    }

    if(q.question === undefined || q.type === undefined || q.min === undefined || q.max === undefined || q.nAnswers === undefined || q.answers === undefined){
      console.log("props undef");
      invalid++;
      continue;
    }

    if(q.min < 0 || q.max < 1 || q.nAnswers < 1){
      console.log("ranges too small");
      invalid++;
      continue;
    }

    if(q.min > q.max || q.max > q.nAnswers || q.nAnswers > 10){
      console.log("ranges too big");
      invalid++;
      continue;
    }

    if(q.type.trim().length === 0){
      console.log("type too short");
      invalid++;
      continue;
    }

    switch(q.type){
      case "open":
        if(q.question.trim().length === 0){
          console.log("q too short");
          invalid++;
          continue
        }

        if(q.max !== q.nAnswers && q.nAnswers !== 1){
          console.log("open must have max = nans");
          invalid++;
          continue
        }

        break;

      case "close":
        if(q.answers.length < q.min || q.answers.length > q.nAnswers){
          console.log("close must have ranges correct");
          invalid++;
          continue;
        }

        if(q.answers.length != q.nAnswers){
          console.log("open must have max = nans");
          invalid++;
          continue;
        }

        if(!q.answers.every((opt) => opt.trim().length > 0)){
          console.log("opts too short");
          invalid++;
          continue;
        }

        if(!q.answers.every((opt) => q.answers.indexOf(opt) === q.answers.lastIndexOf(opt))){
          console.log("opts duplicate");
          invalid++;
          continue;
        }
        break;
      
      default:
        invalid++;
        break;
    }
  }

  if(invalid > 0){
    return res.status(422).json({ error: `Found ${invalid} invalid answers.`});
  }


  return next();
}


app.post('/api/surveys', [
  body('title', 'Title must not be empty/whitespaces only.').not().isEmpty({ ignore_whitespace:true }),
  body('questions', 'Questions must be provided.').not().isEmpty({ ignore_whitespace:true }),
], [isLoggedIn, validateQuestions], async (req, res) => {
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
      res.status(200).json({ msg: `Added survey with id: ${surveyId}.` });
  } catch (err) {
      res.status(500).json({ error: err });
  }
});

const validateAnswer = async (req, res, next) => {
  const survey = await surveyDao.getSurvey(req.body.surveyId);
  if(survey.id === undefined)
    return res.status(404).json({ error: `Survey ${req.body.surveyId} not found.`});

  const questions = survey.questions;
  const answers = JSON.parse(req.body.answers);

  let invalid = 0;
  for(let i = 0; i < questions.length; i++){
    const q = questions[i];
    const a = answers[i];

    if(a === undefined){
      invalid++;
      continue;
    }

    switch(q.type){
      case "open":
        if(a.length === 0 && q.min < 1){
          continue;
        }else if (a.length === 0){
          invalid++;
          continue;
        }

        if(a[0] === "" && q.min > 0){
          invalid++;
          continue;
        }

        if(a[0].length > 200){
          invalid++;
          continue;
        }
        break;

      case "close":
        if(a.length < q.min || a.length > q.max){
          invalid++;
          continue;
        }

        if(!a.every((opt) => q.answers.includes(opt))){
          invalid++;
          continue;
        }
        break;
      
      default:
        break;
    }
  }

  if(invalid > 0){
    return res.status(422).json({ error: `Found ${invalid} invalid answers.`});
  }


  return next();
}

app.post('/api/answers', [
  body('userName', 'Username must not be empty/whitespaces only.').not().isEmpty({ ignore_whitespace:true }),
  body('answers', 'Answers must be provided.').not().isEmpty({ ignore_whitespace:true }),
  body('surveyId', 'SurveyId must be an integer.').isInt(),
], validateAnswer, async (req, res) => {
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
        res.status(200).json({ msg: `Added answer with id: ${answerId}.` });
    } catch (err) {
        res.status(500).json({ error: err });
    }
});


// non richiesta ma comoda per il debug
app.delete('/api/surveys/:id', [
  check('id', 'id must be an integer').isInt()
], isLoggedIn, async (req, res) => {
  try {
      // input sanitization
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
          return res.status(422).json({ errors: errors.array() })
      }

      const surveyDeleted = await surveyDao.deleteSurvey(req.params.id, req.user.id);
      console.log("got surveydeleted", surveyDeleted);
      if (surveyDeleted)
          res.status(200).json({ msg: `Deleted survey with id: ${req.params.id}.` });
      else
          res.status(404).json({ err: `User ${req.user.id} has no survey with id: ${req.params.id}.`});
  } catch (err) {
      console.log(err);
      res.status(500).json({err: err});
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}/`));