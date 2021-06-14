import { Form, Button, Alert } from 'react-bootstrap';
import { useState } from 'react';


function LoginForm(props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('') ;
  
  const handleSubmit = (event) => {
      event.preventDefault();
      setErrorMessage('');
      const credentials = { username, password };

      if(username === ''){
        setErrorMessage('Username cannot be empty!');
        return;
      }
      if(password === ''){
        setErrorMessage('Password cannot be empty!');
        return;
      }  
      if(password.length < 6){
        setErrorMessage('Minimum length for the password is 6 characters!');
        return;
      }
      const validateEmail = (email) => {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
      }
      if(validateEmail(username) === false){
        setErrorMessage('Enter a valid email!');
        return;
      }

      props.login(credentials);
  };

  return (
    <Form className="m-5">
      <Form.Group controlId='username'>
          <Form.Label>Email</Form.Label>
          <Form.Control type='email' value={username} onChange={ev => setUsername(ev.target.value)} />
      </Form.Group>
      <Form.Group controlId='password'>
          <Form.Label>Password</Form.Label>
          <Form.Control type='password' value={password} onChange={ev => setPassword(ev.target.value)} />
      </Form.Group>
      <Button type="submit" variant="warning" onClick={handleSubmit}>Login</Button>
      {errorMessage ? <Alert className="mt-2" variant='danger'>{errorMessage}</Alert> : ''}
      {props.authError ? <Alert className="mt-2" variant='danger'>{props.authError}</Alert> : ''}
    </Form>
    )
}



export default LoginForm;