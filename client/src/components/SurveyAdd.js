import { Form, Alert, Button } from "react-bootstrap";
import { useHistory } from "react-router";
import { useState } from "react";

import QuestionBuilder from './QuestionBuilder.js';

import API from "../API/API.js"


function SurveyAdd(props) {
    const [questions, setQuestions] = useState([]);
    const [title, setTitle] = useState('');
    const [mainError, setMainError] = useState('');
    const history = useHistory();

    const addQuestion = () => {
        const q = {type: '', question: '', min: 0, max: 1, nAnswers: 1, answers:[''], err: {quest: '', type: '', answers: {}}};
        setQuestions([...questions, q]);
    }

    const editQuestions = (index, q) =>{
        const t = [...questions];
        let qq = {...q}
        if(q.type === "open"){
            qq.max = 1;
            qq.nAnswers = 1;
            qq.answers = [""];
        }
        if(q.max > q.nAnswers){
            qq.max = q.nAnswers;
        }
        t[index] = qq;
        setQuestions([...t]);
    }

    const moveQuestion = (index, step) => {
        // non dovrebbe mai succedere ma non si sa mai
        if(index+step < 0 || index+step > questions.length) return;

        const t = [...questions];
        const temp = t[index+step];
        t[index+step] = t[index];
        t[index] = temp;
        setQuestions([...t]);
    }

    const removeQuestion = (index) =>{
        let t = [...questions];
        t.splice(index, 1);
        setQuestions([...t]);
    }

    const handleCancel = () => {
        props.requestUpdate();
        history.push("/");
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        setMainError('');

        if(title.trim().length === 0){
            setMainError("Survey title cannot be empty!");
            return;
        }

        if(questions.length === 0){
            setMainError("You must add at least one question!");
            return;
        }

        const newQs = [...questions];
        let invalid = 0;
        for(let i = 0; i < questions.length; i++){
            const q = questions[i];
            q.err = {quest: '', type: '', answers: {}};
            if(q.question.trim().length === 0) {q.err.quest = "Please provide a question."; invalid++;}
            if(q.type.trim().length === 0) {q.err.type = "Please select a type."; invalid++;}

            if(q.type === 'close'){
                for(let k = 0; k < q.answers.length; k++){
                    if(q.answers[k].trim().length === 0) {
                        q.err.answers[k] = "Please provide an answer."; invalid++;
                    }else if(q.answers.indexOf(q.answers[k]) !== q.answers.lastIndexOf(q.answers[k])){
                        //evitiamo duplicati
                        q.err.answers[k] = "Please remove duplicates."; invalid++;
                    }
                }
            }
            newQs[i] = q;
        }

        if(invalid){
            const err = invalid > 1 ? `Please check your questions, there are ${invalid} issues.` : `Please check your questions, there is an issue.`;
            setMainError(err);
            setQuestions([...newQs]);
            return;
        }

        const qs = questions.map((q) => {
            const {err, ...ret} = q;
            return ret;
        });

        // inizialmente ogni sondaggio ha nAnswers = 0, quindi lasciamo che se ne occupi il db settando 0 come valore di default
        // similmente lo userId viene settato server-side a partire dal cookie session
        const survey = {title: title, questions: qs};

        addSurvey(survey);
    }

    const addSurvey = async(survey) => {
        API.addSurvey(survey)
        .then(() =>  {props.requestUpdate(); history.push("/");})
        .catch(() => setMainError("Error contacting the server."));
    }

    const surveyContent = questions.map((question, index) => (
        <QuestionBuilder err={question.err} move={moveQuestion} first={index===0} last={(index===questions.length-1)} q={question} editQuestions={editQuestions} removeQuestion={removeQuestion} key={index} index={index}></QuestionBuilder>
      )); 

    return (
        <>
        <div className="text-center m-4">
            <Form>
                <Form.Group >
                    <Form.Control placeholder = {'Survey title'}  value={title} onChange={ev => setTitle(ev.target.value)}></Form.Control>
                </Form.Group>
                <div className="justify-content-center text-center mb-4">
                    {surveyContent}
                </div>
                <Button variant="dark" className="mx-1" onClick={() => addQuestion()}>Add a new question</Button>
                <Button variant="dark" className="mx-1" onClick={(event) => handleSubmit(event)} type="submit">Publish</Button>
                <Button variant="secondary" className="mx-1" onClick={() => handleCancel()}>Cancel</Button>
                {mainError ? <Alert variant='danger' onClose={() => setMainError('')} dismissible className="mt-4">{mainError}</Alert> : false}
            </Form>
        </div>
        </>
    )
  }


export default SurveyAdd;