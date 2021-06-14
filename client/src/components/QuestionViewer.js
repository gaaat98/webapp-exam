import { Form, Toast, InputGroup } from "react-bootstrap";

function QuestionViewer(props){
    let bodyContent = <></>;
    let headerInfo = '';


    switch(props.q.type){
        case "open":
            bodyContent = <>
            <InputGroup>
                <InputGroup.Prepend>
                    <InputGroup.Text className="font-weight-bold font-italic">{props.readOnly ? "Answer:" : "Your Answer:"}</InputGroup.Text>
                </InputGroup.Prepend>
                {/*https://stackoverflow.com/questions/32232659/react-inline-conditionally-pass-prop-to-component*/}
                <Form.Control 
                    value={props.givenAnswers} 
                    readOnly={props.readOnly} 
                    maxLength={200} 
                    as="textarea"
                    isInvalid={props.readOnly ? undefined : (props.err !== '')} 
                    onChange={props.readOnly ? undefined :
                        (event) => {
                            props.cleanError(props.index);
                            props.editAnswers(props.index, [event.target.value])
                        }
                    }
                />
                {props.readOnly ? false : <Form.Control.Feedback type="invalid">{props.err}</Form.Control.Feedback>}
            </InputGroup>
            </>
            break;

        case "close":
                let options;
                const answerFeedback = props.readOnly ? false 
                    :
                    <>
                        <Form.Control hidden isInvalid={props.err !== ''}/>
                        <Form.Control.Feedback type="invalid">{props.err}</Form.Control.Feedback>
                    </>

                if(props.q.max > 1){
                    headerInfo = ` (Selections: min. ${props.q.min}, max. ${props.q.max})`;
                    options = props.q.answers.map((answer, index) => (
                        <InputGroup key={index} className="m-1">
                        <InputGroup.Prepend>
                            <InputGroup.Checkbox 
                                checked={props.givenAnswers.includes(answer)} 
                                disabled={props.readOnly} 
                                value={answer} 
                                name={`q-${props.index}-ans`} 
                                onChange={props.readOnly ? undefined :
                                    (event) => {
                                        const v = event.target.value;
                                        let a = [...props.givenAnswers, v];
                                        a = [...new Set(a)];
                                        if(!event.target.checked){
                                            a.splice(a.indexOf(v), 1);
                                        }
                                        props.cleanError(props.index);
                                        props.editAnswers(props.index, a);
                                    }
                                }
                            />
                        </InputGroup.Prepend>
                        <Form.Control value={answer} readOnly={true}/>
                        </InputGroup>
                        ));
                }else{
                    options = props.q.answers.map((answer, index) => (
                        <InputGroup className="m-1" key={index}>
                        <InputGroup.Prepend>
                            <InputGroup.Radio 
                                checked={props.givenAnswers.includes(answer)} 
                                disabled={props.readOnly} 
                                value={answer} 
                                name={`q-${props.index}-ans`} 
                                onChange={props.readOnly ? undefined :
                                    (event) => {
                                        props.cleanError(props.index);
                                        props.editAnswers(props.index, [event.target.value]);
                                    }
                                }
                                onDoubleClick={props.readOnly ? undefined :
                                    (event) => {
                                        if(event.target.checked)
                                            props.editAnswers(props.index, []);
                                    }
                                }
                            />
                        </InputGroup.Prepend>
                        <Form.Control value={answer} readOnly={true}/>
                        </InputGroup>
                        ));
                }
                bodyContent = <>
                    <Form.Group className="m-1">
                        {options}
                        {answerFeedback}
                    </Form.Group>
                </>
            break;

        default:
            break;

    }
    return (
        <Toast className="mw-100 bg-dark align-middle my-4">
            <div className="toast-header justify-content-between">
                <div className="text-break text-wrap h6">
                    <strong>{props.q.question+headerInfo}</strong>
                </div>
                {props.q.min > 0 ? "Required" : false}
            </div>
            <Toast.Body>
                {bodyContent}
            </Toast.Body>
        </Toast>
);
}

export default QuestionViewer;