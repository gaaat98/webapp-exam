import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from "react"
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";
import './App.css';
import './components/Navbar.js'
import MyNavbar from './components/Navbar.js';
import SurveyList from './components/SurveyList.js';
import SurveyAdd from './components/SurveyAdd.js';
import SurveyFill from './components/SurveyFill.js';


function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [surveys, setSurveys] = useState([{"title":"Survey bello","questions":[{"type":"open","question":"Open mand","min":1,"max":1,"nAnswers":1,"answers":[""]},{"type":"close","question":"multiple mand single","min":1,"max":1,"nAnswers":3,"answers":["a","b","c"]},{"type":"open","question":"Open opt","min":0,"max":1,"nAnswers":1,"answers":[""]},{"type":"close","question":"multiple mand mult","min":1,"max":3,"nAnswers":3,"answers":["mult1","mult2","mult3"]},{"type":"close","question":"mult mult opt","min":0,"max":2,"nAnswers":4,"answers":["solo2","solo22","solo222","solo2222"]}],"nAnswers":0}]);

  useEffect(()=> {
    const checkAuth = async() => {
      try {
        //await API.getUserInfo();
        setLoggedIn(true);
      } catch(err) {
        console.error(err.error);
      }
    };
    checkAuth();
  }, []);

  const doLogIn = async (credentials) => {
    try {
      //const user = await API.logIn(credentials);
      setLoggedIn(true);
      //setMessage({ msg: `Welcome, ${user}!`, type: 'bg-success' });
    } catch (err) {
      //setMessage({ msg: err, type: 'bg-danger' });
    }
  }

  const doLogOut = async () => {
    //await API.logOut();
    setLoggedIn(false);
    // clean up everything
    //setTasks([]);
    //setMessage('');
  }

  //const s = [{name: "culo", n_answers: 10}, {name: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", n_answers: 0}];

  return (
    <Router>
      <MyNavbar loggedIn={loggedIn} doLogIn={doLogIn} doLogOut={doLogOut}/>
      <Switch>
      <Route exact path="/add" render={() =>
                {return loggedIn ? <SurveyAdd surveys={surveys} setSurveys={setSurveys} ></SurveyAdd> : <Redirect to="/login" />}
              }
      />
      <Route exact path="/view" render={() =>
                {return loggedIn ? <></> : <Redirect to="/login" />}
              }
      />
      <Route exact path="/login" render={() =>
                {return loggedIn ? <Redirect to="/" /> : <></>}
              }
      />
      <Route exact path="/fill" render={() =>
                {return loggedIn ? <Redirect to="/" /> : <SurveyFill></SurveyFill>}
              }
      />
      <Route exact path="/" render={() =>
                <SurveyList loggedIn={loggedIn} surveys={surveys} setSurveys={setSurveys} username={"admin"}/>
              }
      />
      <Redirect to="/" />
      </Switch>
    </Router>
);
}

export default App;
