import { Navbar, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import {iconLogOut, iconLogIn, iconBrand} from "../resources/icons.js"

function MyNavbar(props) {

    return (
        <Navbar bg="dark" variant="dark" expand="sm" className="justify-content-between px-2">
            <Navbar.Brand as={Link} onClick={() => props.requestUpdate()} to="/">
                {iconBrand}{' '}
                SurveyMaster 5000
            </Navbar.Brand>
            {props.loggedIn ?
            <Button onClick={() => props.doLogOut()} variant="secondary">{iconLogOut}{" Log Out"}</Button>
            :
            <Button variant="secondary" as={Link} to={{
                pathname: "/login"
            }}>
                {iconLogIn}{" Log In"}
            </Button>
            }
        </Navbar>
    );
}

export default MyNavbar;