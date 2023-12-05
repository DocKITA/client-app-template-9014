import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import Form from "./Form";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";

interface RecordListProps {
  tableName: string;
}

const Main = () => {
  // Read props and pass tableName to backend to read data
  return (
    <Table striped bordered responsive>
      <thead
        style={{
          textAlign: "center",
          backgroundColor: process.env.REACT_APP_APPLICATION_THEME_COLOR,
        }}
      >
        <tr>
          <th style={{ width: "2%" }}>ID</th>
          <th style={{ width: "30%" }}>Record</th>
          <th style={{ width: "2%" }}>Action</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style={{ textAlign: "center" }}>1</td>
          <td>Record 1</td>
          <td style={{ textAlign: "center" }}>
            <Button
              variant="outline-light"
              style={{
                backgroundColor: process.env.REACT_APP_APPLICATION_THEME_COLOR,
              }}
            >
              View
            </Button>
          </td>
        </tr>
        <tr>
          <td style={{ textAlign: "center" }}>2</td>
          <td>Record 2</td>
          <td style={{ textAlign: "center" }}>
            <Button
              variant="outline-light"
              style={{
                backgroundColor: process.env.REACT_APP_APPLICATION_THEME_COLOR,
              }}
            >
              View
            </Button>
          </td>
        </tr>
        <tr>
          <td style={{ textAlign: "center" }}>3</td>
          <td>Record 3</td>
          <td style={{ textAlign: "center" }}>
            <Button
              variant="outline-light"
              style={{
                backgroundColor: process.env.REACT_APP_APPLICATION_THEME_COLOR,
              }}
            >
              View
            </Button>
          </td>
        </tr>
      </tbody>
    </Table>
  );
};

const FormRecordList: React.FC<RecordListProps> = (props) => {
  const { tableName } = props;

  useEffect(() => {
    console.log(`Table Name: `, tableName);
  });
  return (
    <Routes>
      <Route path="/" element={<Main />} />
      <Route path="/:record_id" element={<Form />} />
    </Routes>
  );
};

export default FormRecordList;
