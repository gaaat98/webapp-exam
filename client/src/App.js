import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from "react"
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";
import { Toast } from "react-bootstrap";
import './App.css';

import MyNavbar from './components/Navbar.js';
import SurveyList from './components/SurveyList.js';
import SurveyAdd from './components/SurveyAdd.js';
import SurveyFill from './components/SurveyFill.js';
import SurveyView from './components/SurveyView.js';
import LoginForm from './components/LoginForm.js';

import API from "./API/API.js"

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [surveys, setSurveys] = useState([]);
  const [adminName, setAdminName] = useState('');
  const [authError, setAutherror] = useState('');

  const [loading, setLoading] = useState(true);
  const [needTasksUpdate, setNeedTasksUpdate] = useState(true);

  const requestUpdate = () => {
    setLoading(true);
    setNeedTasksUpdate(true);
  }

  useEffect(()=> {
    const checkAuth = async() => {
      try {
        const user = await API.getAdminInfo();
        setAdminName(user.name);
        setLoggedIn(true);
        setNeedTasksUpdate(true);
      } catch(err) {
        console.warn(err.error);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const getSurveyList = async () => {
      let s = [];
      try {
        s = await API.getSurveys();
      } catch (err) {
        s = [];
      }
      setNeedTasksUpdate(false);
      setSurveys(s);
    }

    if(needTasksUpdate){
      setLoading(true);
      getSurveyList().then( () => setTimeout(() => setLoading(false), 1000));
    }
  }, [needTasksUpdate]);


  const doLogIn = async (credentials) => {
    try {
      const user = await API.logIn(credentials);
      setAdminName(user);
      setAutherror('');
      setLoggedIn(true);
      requestUpdate();
    } catch (err) {
      setAutherror(err);
    }
  }

  const doLogOut = async () => {
    await API.logOut();
    setLoggedIn(false);
    setAutherror('');
    requestUpdate();
  }

  return (
    <Router>
      <MyNavbar requestUpdate={requestUpdate} loggedIn={loggedIn} doLogOut={doLogOut}/>
      {loading ? 
      <Toast className="mw-100 bg-warning align-middle m-5">
        <div className="toast-header justify-content-between">
            <div className="text-break text-wrap text-center h6">
              <strong className="mr-auto">🕗 Please wait while I'm loading... </strong>
            </div>
        </div>
      </Toast>
       :
      <Switch>
      <Route exact path="/add" render={() =>
                {return loggedIn ? <SurveyAdd requestUpdate={requestUpdate} /> : <Redirect to="/" />}
              }
      />
      <Route exact path="/view" render={() =>
                {return loggedIn ? <SurveyView requestUpdate={requestUpdate} /> : <Redirect to="/" />}
              }
      />
      <Route exact path="/login" render={() =>
                {return loggedIn ? <Redirect to="/" /> : <LoginForm authError={authError} login={doLogIn} />}
              }
      />
      <Route exact path="/fill" render={() =>
                {return loggedIn ? <Redirect to="/" /> : <SurveyFill requestUpdate={requestUpdate}/>}
              }
      />
      <Route exact path="/" render={() =>
                <SurveyList loggedIn={loggedIn} surveys={surveys} setSurveys={setSurveys} username={adminName}/>
              }
      />
      <Redirect to="/" />
      </Switch>
}
    </Router>
);
}

export default App;
