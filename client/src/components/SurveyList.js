import { Table, Button, Alert } from "react-bootstrap";
import { iconEye, iconDelete } from "../resources/icons";
import { Link } from "react-router-dom";
import { useState } from "react";

import API from "../API/API.js";

function SurveyList(props) {
  const [mainError, setMainError] = useState('');
  const header = props.loggedIn ? `${props.username} here are your surveys: ` : "Welcome! Here some surveys for you:";

  const deleteSurvey = async(surveyId) => {
    API.deleteSurvey(surveyId)
    .then(() =>  props.requestUpdate() )
    .catch((err) => setMainError("Error contacting the server.") );
  }

  return (
    <>
      <Table responsive className="justify-content-center text-center" >
        <thead>
          <tr>
            <th style={{ fontSize: 36 }} colSpan="100%">
              <strong><i>{header}</i></strong>
            </th>
          </tr>
        </thead>
        <tbody>
        {
          props.surveys.length === 0 ?
          <tr><td><i>No surveys yet!</i></td></tr>
          :
          props.surveys.map((survey, index) => (
            <SurveyRow admin={props.loggedIn} deleteSurvey={deleteSurvey} key={index} survey={survey}></SurveyRow>
          ))
        }
        {props.loggedIn ? <tr><td colSpan="100%"><Button variant="dark" className="mt-4" as={Link} to={{
            pathname: "/add"
        }}>Add a new survey</Button></td></tr> : <></>}
        </tbody>
      </Table>
      {mainError ? <Alert variant='danger' onClose={() => setMainError('')} dismissible className="mt-4">{mainError}</Alert> : false}
    </>
  );
}

function SurveyRow(props) {
  return (
    <tr>
      <SurveyData survey={props.survey}></SurveyData>
      <SurveyActions admin={props.admin} deleteSurvey={props.deleteSurvey} survey={props.survey} ></SurveyActions>
    </tr>
  );
}

function SurveyData(props) {
  return (
    <>
      <td align="left" style={{"wordBreak": "break-all"}}>
        <b>{props.survey.title}</b>
      </td>
    </>
  );
}

function SurveyActions(props) {
    if(props.admin){
        return (
            <td align="right">
                {
                    props.survey.nAnswers > 0 ?
        
                    <Button as={Link} variant="warning" className="col-sm-5" to={{
                        pathname: "/view",
                        state: { survey: props.survey } //a differenza di /add questa setta uno stato
                      }}>{iconEye}{` View ${props.survey.nAnswers} Answer${props.survey.nAnswers > 1 ? 's' : ''}`}</Button>
                    :
                    <i className="pr-2">No one answered yet :(</i>
                }
                <span title="Delete Survey" className="btn" onClick={() => { props.deleteSurvey(props.survey.id); }}>{iconDelete}</span>
            </td>)
    }else{
        return (
            <td align="right">
            <Button as={Link} variant="warning" to={{
                pathname: "/fill",
                state: { survey: props.survey } //a differenza di /add questa setta uno stato
                }}>
                    Answer this survey!
            </Button>
            </td>
        )
    }
}

export default SurveyList;
