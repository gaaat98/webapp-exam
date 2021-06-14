import { Form, Toast, Row, Col, ButtonGroup, Button } from "react-bootstrap";
import { iconUp, iconDown } from "../resources/icons.js"


function QuestionBuilder(props) {
    let answersRanges;
    let questionBody = <></>;

    switch (props.q.type) {
        case "open":
            answersRanges =
                <Form.Group className="mx-auto">
                    <Form.Label>Mandatory?</Form.Label>
                    <Form.Check type="checkbox" checked={props.q.min === 1} onChange={(ev) => { props.editQuestions(props.index, { ...props.q, min: (ev.target.checked ? 1 : 0) }); }} />
                </Form.Group>
            break;
        case "close":
            answersRanges =
                <>
                    <Form.Group className="mx-2">
                        <Form.Label>Number of Choices</Form.Label>
                        <Form.Control value={props.q.nAnswers} type="number" min={1} max={10} onChange={(ev) => {
                            const t = parseInt(ev.target.value) ? parseInt(ev.target.value) : 1;
                            let v = t > 10 ? 10 : t;
                            v = v < 0 ? 1 : v;
                            let ans = props.q.answers;
                            if (ans.length > v) {
                                ans.splice(v);
                            } else if (ans.length < v) {
                                while (ans.length < v)
                                    ans.push("");
                            }
                            props.editQuestions(props.index, { ...props.q, nAnswers: v, answers: ans });
                        }} />
                    </Form.Group>
                    <Form.Group className="mx-2">
                        <Form.Label>Minimum Choices</Form.Label>
                        <Form.Control value={props.q.min} type="number" min={0} max={props.q.max} onChange={(ev) => {
                            const t = parseInt(ev.target.value) ? parseInt(ev.target.value) : 0;
                            let v = t < props.q.max ? t : props.q.max;
                            v = v < 0 ? 0 : v;
                            props.editQuestions(props.index, { ...props.q, min: v });
                        }} />
                    </Form.Group>
                    <Form.Group className="mx-2">
                        <Form.Label>Maximum Choices</Form.Label>
                        <Form.Control value={props.q.max} type="number" min={1} max={props.q.nAnswers} onChange={(ev) => {
                            const t = parseInt(ev.target.value) ? parseInt(ev.target.value) : 1;
                            let v = t < props.q.nAnswers ? t : props.q.nAnswers;
                            v = v < 1 ? 1 : v;
                            props.editQuestions(props.index, { ...props.q, max: v });
                        }} />
                    </Form.Group>
                </>
            let answers = [];
            for (let i = 0; i < props.q.nAnswers; i++) {
                let content = '';
                if (props.q.answers.length > i)
                    content = props.q.answers[i];
                answers.push(
                    <Form.Group className="mx-2 mt-2 text-white" as={Row} key={`q-${props.index}-a-${i}`}>
                        <Form.Label column="true" sm={2}>{`Answer ${i + 1}: `}</Form.Label>
                        <Col>
                            <Form.Control isInvalid={props.err.answers[i] !== undefined} value={content} onChange={(ev) => {
                                let t = props.q.answers;
                                t[i] = ev.target.value;
                                // rimozione dell'errore se presente
                                if (props.err.answers[i] !== undefined) {
                                    const err_ans = { ...props.err.answers };
                                    delete err_ans[i];
                                    const err = { ...props.err, answers: err_ans };
                                    props.editQuestions(props.index, { ...props.q, answers: t, err: err });
                                } else {
                                    props.editQuestions(props.index, { ...props.q, answers: t });
                                }
                            }} />
                            <Form.Control.Feedback type="invalid">{props.err.answers[i]}</Form.Control.Feedback>
                        </Col>
                    </Form.Group>
                );
            }
            questionBody = <Toast.Body>{answers}</Toast.Body>
            break;

        default:
            break;
    }

    return (
        <Toast className="mw-100 bg-dark align-middle my-4" onClose={() => props.removeQuestion(props.index)}>
            <Toast.Header>
                {/*`Index: ${props.index}`*/}
                <ButtonGroup vertical className="mr-2">
                    <Button size="sm" variant="warning" onClick={() => props.move(props.index, -1)} disabled={props.first}>{iconUp}</Button>
                    <Button size="sm" variant="warning" onClick={() => props.move(props.index, 1)} disabled={props.last}>{iconDown}</Button>
                </ButtonGroup>
                <Form.Group className="ml-0 mr-auto" style={{ width: "45%" }}>
                    <Form.Label>What's the question?</Form.Label>
                    <Form.Control isInvalid={props.err.quest !== ''} value={props.q.question} onChange={(ev) => {
                        if (props.err.quest !== '') {
                            const err = { ...props.err, quest: '' };
                            props.editQuestions(props.index, { ...props.q, question: ev.target.value, err: err });
                        } else {
                            props.editQuestions(props.index, { ...props.q, question: ev.target.value });
                        }
                    }} ></Form.Control>
                    <Form.Control.Feedback type="invalid">{props.err["quest"]}</Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mx-2">
                    <Form.Label>Type</Form.Label>
                    <Form.Control isInvalid={props.err.type !== ''} as="select" value={props.q.type} onChange={(ev) => {
                        if (props.err.type !== '') {
                            const err = { ...props.err, type: '' };
                            props.editQuestions(props.index, { ...props.q, type: ev.target.value, err: err });
                        } else {
                            props.editQuestions(props.index, { ...props.q, type: ev.target.value });
                        }
                    }}>
                        <option></option>
                        <option value="open">Open Answer</option>
                        <option value="close">Multiple Choice</option>
                    </Form.Control>
                    <Form.Control.Feedback type="invalid">{props.err["type"]}</Form.Control.Feedback>
                </Form.Group>
                {answersRanges}
            </Toast.Header>
            {questionBody}
        </Toast>
    );
}



export default QuestionBuilder;