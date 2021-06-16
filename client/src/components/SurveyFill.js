import { Form, Button, Alert } from "react-bootstrap";
import { Redirect, useHistory, useLocation } from "react-router-dom";
import { useState } from "react";

import QuestionViewer from "./QuestionViewer.js"

import API from "../API/API.js"

function SurveyFill(props){
    const location = useLocation();
    const survey = location.state ? location.state.survey : false;
    const [name, setName] = useState('');
    const [mainError, setMainError] = useState('');
    const history = useHistory();
    const [answers, setAnswers] = useState(survey ? Array(survey.questions.length).fill([]) : []);
    const [questionErrors, setQuestionErrors] = useState(survey ? Array(survey.questions.length).fill('') : []);

    if(location.state === undefined){
        return <Redirect to="/"/>
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        setMainError('');

        // empty string or whitespaces only
        if(name.trim().length === 0){
            setMainError("Your name cannot be empty!");
            return;
        }

        let invalid = 0;
        const tempErr = [...questionErrors];
        for(let i = 0; i < survey.questions.length; i++){
            const q = survey.questions[i];

            if(answers[i].length < q.min){
                invalid++;

                // messaggio per domande aperte e radio btn
                if(q.type === "open" || q.min === 1)
                    tempErr[i] = 'This question is mandatory.';
                else if (q.type === "close")
                    tempErr[i] = `This question is mandatory. Check at least ${q.min} options.`;
                continue;
            }

            if(answers[i].length > q.max){
                // non dovrebbe mai succedere
                invalid++;
                tempErr[i] = 'Too many answers.';
                continue;
            }

            if(q.type === "open" && answers[i][0] && answers[i][0].length > 200){
                // non dovrebbe mai succedere perchè è gestito dal component
                invalid++;
                tempErr[i] = `Max 200 characters for text answer. You wrote ${answers[i][0].length}`;
                continue;
            }

            if(q.type === "open" && answers[i][0] && answers[i][0].trim().length === 0){
                // non dovrebbe mai succedere perchè è gestito dal component
                invalid++;
                tempErr[i] = `Whitespaces only open answer is not valid.`;
                continue;
            }
        }

        if(invalid){
            const err = invalid > 1 ? `Please check your answers, there are ${invalid} issues.` : `Please check your answer, there is an issue.`;
            setMainError(err);
            setQuestionErrors([...tempErr]);
            return;
        }

        // survey.title verrà sostituito con survey.id
        // l'API del backend si dovrà occupare di aggiornare il numero di risposte
        const answerObj = {surveyId: survey.id, userName: name, answers: answers};
        //non bisogna poi settare nulla, solo inviare all'api, le risposte verranno poi fetchate da SurveyView
        addAnswer(answerObj);
    };

    const addAnswer = async(answer) => {
        API.addAnswer(answer)
        .then(() =>  {props.requestUpdate(); history.push("/");})
        .catch((err) => setMainError("Error contacting the server.") );
    }

    const handleCancel = () => {
        props.requestUpdate();
        history.push("/");
    };

    const editAnswers = (index, a) =>{
        const t = [...answers];
        if(a.length > survey.questions[index].max){
            return;
        }
        t[index] = a;
        setAnswers([...t]);
    }

    const cleanError = (index) => {
        const e = [...questionErrors];
        e[index] = '';
        setQuestionErrors([...e]);
    }

    const surveyContent = survey.questions.map((question, index) =>(
        <QuestionViewer cleanError={cleanError} err={questionErrors[index]} readOnly={false} editAnswers={editAnswers} givenAnswers={answers[index]} q={question} key={index} index={index}/>
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
                <Button variant="secondary" className="mx-1" onClick={() => handleCancel()}>Cancel</Button>
                {mainError ? <Alert variant='danger' onClose={() => setMainError('')} dismissible className="mt-4">{mainError}</Alert> : false}
            </Form>
        </div>
}


export default SurveyFill