import { Form, Button, Alert } from "react-bootstrap";
import { Redirect, useHistory, useLocation } from "react-router-dom";
import { useState } from "react";

import QuestionViewer from "./QuestionViewer.js"

function SurveyFill(props){
    const location = useLocation();
    const survey = location.state.survey;
    const [name, setName] = useState('');
    const [mainError, setMainError] = useState('');
    const history = useHistory();
    const [answers, setAnswers] = useState(survey ? Array(survey.questions.length).fill([]) : []);
    const [questionErrors, setQuestionErrors] = useState(survey ? Array(survey.questions.length).fill('') : []);

    const handleSubmit = (event) => {};
    const handleCancel = (event) => {
        event.preventDefault();
        history.push("/");
    };

    if(location.state === undefined){
        return <Redirect to="/"/>
    }

    console.log(survey);

    const editAnswers = (index, a) =>{
        const t = [...answers];
        if(a.length > survey.questions[index].max){
            return;
        }
        t[index] = a;
        setAnswers([...t]);
    }

    const surveyContent = survey.questions.map((question, index) =>(
        <QuestionViewer err={questionErrors[index]} readOnly={false} editAnswers={editAnswers} givenAnswers={answers[index]} q={question} key={index} index={index}/>
    ));

    return <div className="text-center m-4">
        <h1><strong><i>{survey.title}</i></strong></h1>
            <Form>
                <Form.Group>
                    <Form.Label>Please insert your name</Form.Label>
                    <Form.Control placeholder = {'Your name'}  value={name} onChange={ev => setName(ev.target.value)}></Form.Control>
                </Form.Group>
                <div className="justify-content-center text-center mb-4">
                    {surveyContent}
                </div>
                <Button variant="dark" className="mx-1" onClick={(event) => handleSubmit(event)} type="submit">Submit</Button>
                <Button variant="secondary" className="mx-1" onClick={(event) => handleCancel(event)} type="cancel">Cancel</Button>
                {mainError ? <Alert variant='danger' onClose={() => setMainError('')} dismissible className="mt-4">{mainError}</Alert> : false}
            </Form>
        </div>
}


export default SurveyFill