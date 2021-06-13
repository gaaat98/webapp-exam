import { Form, Toast, InputGroup } from "react-bootstrap";

function QuestionViewer(props){
    let bodyContent = <></>;
    let headerInfo = '';
    switch(props.q.type){
        case "open":
            bodyContent = <>
            <InputGroup>
                <InputGroup.Prepend>
                    <InputGroup.Text><b><i>Your Answer:</i></b></InputGroup.Text>
                </InputGroup.Prepend>
                <Form.Control value={props.givenAnswers} isInvalid={props.err !== ''} readOnly={props.readOnly} maxLength={200} as="textarea" onChange={
                    (event) => props.editAnswers(props.index, [event.target.value])
                }/>
                <Form.Control.Feedback type="invalid">{props.err}</Form.Control.Feedback>
            </InputGroup>
            </>
            break;

        case "close":
                let options;
                if(props.q.max > 1){
                    headerInfo = ` (max. ${props.q.max} selections)`;
                    options = props.q.answers.map((answer, index) => (
                        <InputGroup key={index} className="m-1">
                        <InputGroup.Prepend>
                            <InputGroup.Checkbox checked={props.givenAnswers.includes(answer)} value={answer} name={`q-${props.index}-ans`} onChange={
                                (event) => {
                                    const v = event.target.value;
                                    let a = [...props.givenAnswers, v];
                                    a = [...new Set(a)];
                                    if(!event.target.checked){
                                        a.splice(a.indexOf(v), 1);
                                    }
                                    props.editAnswers(props.index, a);
                                }
                            }/>
                        </InputGroup.Prepend>
                        <Form.Control value={answer} readOnly={true}/>
                        </InputGroup>
                        ));
                }else{
                    options = props.q.answers.map((answer, index) => (
                        <InputGroup className="m-1" key={index}>
                        <InputGroup.Prepend>
                            <InputGroup.Radio checked={props.givenAnswers.includes(answer)} value={answer} name={`q-${props.index}-ans`} onChange={
                                (event) => props.editAnswers(props.index, event.target.value)
                            }/>
                        </InputGroup.Prepend>
                        <Form.Control value={answer} readOnly={true}/>
                        </InputGroup>
                        ));
                }
                bodyContent = <>
                    <Form.Group className="m-1">
                        {options}
                        <Form.Control hidden isInvalid={props.err !== ''}/>
                        <Form.Control.Feedback type="invalid">{props.err}</Form.Control.Feedback>
                    </Form.Group>
                </>
            break;

        default:
            break;

    }
    return (
        <Toast className="mw-100 bg-dark align-middle my-4">
            <div className="toast-header">
                <h5><strong><i>{props.q.question+headerInfo}</i></strong></h5>
            </div>
            <Toast.Body>
                {bodyContent}
            </Toast.Body>
        </Toast>
);
}

export default QuestionViewer;