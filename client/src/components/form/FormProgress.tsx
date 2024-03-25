import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Tabs,
  Tab,
  Form,
  Button,
  Card,
  Container,
  Image,
  Alert,
  Modal,
  Table,
} from "react-bootstrap";



const FormProgress= () => {
    return (
        <><Row>
        <Col>
            <h5>Form Approval Page</h5>
        </Col>
    </Row>
    <Row>
    <Table striped bordered hover>
        <thead>
            <tr>
                <th>#</th>
                <th>Form Name</th>
                <th>Date Sent</th>
                <th>Current Round</th>
                <th>Form Status</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>1</td>
                <td>Form 1</td>
                <td>date</td>
                <td>Approved</td>
                <td>Approved</td>
            </tr>
            <tr>
                <td>2</td>
                <td>Form 2</td>
                <td>date</td>
                <td>Approved</td>
                <td>Approved</td>
            </tr>
            <tr>
                <td>3</td>
                <td>Form 3</td>
                <td>date</td>
                <td>Approved</td>
                <td>Approved</td>
            </tr>
        </tbody>
    </Table>
    </Row></>
        
    );
};

export default FormProgress;