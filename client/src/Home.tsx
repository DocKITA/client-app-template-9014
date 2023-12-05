import React from "react";
import { User } from "@auth0/auth0-spa-js";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import routesData from "./../routes.json";
import { Route, Routes } from "react-router-dom";
import FormRecordList from "./components/form/FormRecordList";
import { useAuth0 } from "@auth0/auth0-react";

interface UserProps {
  isAuthenticated: boolean;
  user: User;
}

const Main = () => {
const { isAuthenticated, user } = useAuth0;

// Implement a onClick function for that button, send the data back to parent component

  return (
    <div>
      <Table striped bordered responsive>
        <thead
          style={{
            textAlign: "center",
            backgroundColor: process.env.REACT_APP_APPLICATION_THEME_COLOR,
          }}
        >
          <tr>
            <th style={{ width: "2%" }}>#</th>
            <th style={{ width: "30%" }}>Page</th>
            <th style={{ width: "2%" }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {routesData["form-list"].map((form, index) => (
            <tr key={index}>
              <td style={{ textAlign: "center" }}>{index + 1}</td>
              <td>{form.name}</td>
              <td style={{ textAlign: "center" }}>
                <Button
                  variant="outline-light"
                  style={{
                    backgroundColor:
                      process.env.REACT_APP_APPLICATION_THEME_COLOR,
                  }}
                  href={`/${form.url}`}
                >
                  View
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

const Home = () => {
  // Use useNavigate to navigate user to other page
  return (
    <Routes>
      <Route path="/" element={<Main />} />
      <Route path="/f/*" element={<FormRecordList tableName="" />} />
    </Routes>  
  )
};


export default Home;
