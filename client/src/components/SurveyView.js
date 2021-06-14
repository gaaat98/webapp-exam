import { Button, ButtonGroup, DropdownButton, Dropdown, Toast } from "react-bootstrap";
import { Redirect, useHistory, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

import QuestionViewer from "./QuestionViewer.js"
import RandomHeader from "./RandomHeader.js"
import {iconLeft, iconRight} from "../resources/icons.js"

import API from "../API/API.js"

function SurveyView(props){
    const location = useLocation();
    const survey = location.state ? location.state.survey : false;
    const history = useHistory();

    // lista di answerObj che verrà fetchata tramite le API
    const [answers, setAnswers] = useState([]);
    const [userIndex, setUserIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    let surveyContent = [];
    let dropDownItems = [];

    useEffect(()=> {
        const getAnswers = async() => {
          try {
            const answers = await API.getAnswers(survey.id);

            setAnswers(answers);
          } catch(err) {
            console.error(err.error);
          }
        };
        getAnswers().then( () => setTimeout(() => setLoading(false), 500));;
      }, [survey.id]);
    
    if(location.state === undefined){
        return <Redirect to="/"/>
    }

    const handleCancel = (event) => {
        event.preventDefault();
        props.requestUpdate();
        history.push("/");
    };

    if(!loading){
        surveyContent = survey.questions.map((question, index) =>(
            <QuestionViewer readOnly={true} givenAnswers={answers[userIndex].answers[index]} q={question} key={index} index={index}/>
        ));
    
        dropDownItems = answers.map((answer, index) => (
            <Dropdown.Item key={index} onClick={() => setUserIndex(index)}>{answer.userName}</Dropdown.Item>
        ));
    }else{
        return <Toast className="mw-100 bg-warning align-middle m-5">
                    <div className="toast-header justify-content-between">
                        <div className="text-break text-wrap text-center h6">
                        <strong className="mr-auto">🕗 Please wait while I'm loading... </strong>
                        </div>
                    </div>
                </Toast>
    }

    return <div className="text-center m-4">
            <h1><strong><i>{survey.title}</i></strong></h1>
            <div className="d-flex justify-content-between bg-warning rounded text-left p-2">
                <RandomHeader name={answers[userIndex].userName}/>
                <ButtonGroup>
                    <Button disabled={userIndex === 0} onClick={() => setUserIndex(userIndex-1)} variant="secondary">{iconLeft}</Button>
                    <DropdownButton variant="secondary" as={ButtonGroup} title="Select User">
                        {dropDownItems}
                    </DropdownButton>
                    <Button disabled={userIndex === answers.length-1} onClick={() => setUserIndex(userIndex+1)} variant="secondary">{iconRight}</Button>
                </ButtonGroup>
            </div>
            <div className="justify-content-center text-center mb-4">
                {surveyContent}
            </div>
            <Button variant="secondary" className="mx-1" onClick={(event) => handleCancel(event)} type="cancel">Home</Button>
        </div>
}


export default SurveyView