import { useEffect, useState } from "react";
import {
    Link,
    Route,
    Routes,
    useNavigate,
} from "react-router-dom";
import {
    Breadcrumb,
    Col,
    Container,
    Row,
    Navbar,
    Image,
    Nav,
    Dropdown,
    NavDropdown,
    Accordion,
    Button,
    Offcanvas,
    Spinner,
} from "react-bootstrap";
import { useAuth0 } from "@auth0/auth0-react";

interface FormProps {
    fileName: string;
    tableName: string;
}

const ModifyRecord: React.FC<FormProps> = (props) => {
    const { fileName, tableName } = props;

    useEffect(() => {
        console.log(`File Name: `, fileName);
    }, []);

    return (
        <Row>
            <Col>
                Modify Record {fileName}
            </Col>
        </Row>
    )
}

export default ModifyRecord