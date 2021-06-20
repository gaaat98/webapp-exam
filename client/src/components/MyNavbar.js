import { Navbar, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import {iconLogOut, iconLogIn, iconBrand} from "../resources/icons.js"

function MyNavbar(props) {

    return (
        <Navbar bg="dark" variant="dark" expand="sm" className="justify-content-between px-2">
            <Navbar.Brand as={Link} style={{color: "#ffc107"}} onClick={() => props.requestUpdate()} to="/">
                {iconBrand}{' '}
                <strong><i>SurveyMaster 5000</i></strong>
            </Navbar.Brand>
            {props.loggedIn ?
            <Button style={{color: "#ffc107"}} onClick={() => props.doLogOut()} variant="secondary">{iconLogOut}{" Log Out"}</Button>
            :
            <Button style={{color: "#ffc107"}} variant="secondary" as={Link} to={{
                pathname: "/login"
            }}>
                {iconLogIn}{" Log In"}
            </Button>
            }
        </Navbar>
    );
}

export default MyNavbar;