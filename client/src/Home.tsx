import React from "react";
import { User } from "@auth0/auth0-spa-js";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";

interface UserProps {
  isAuthenticated: boolean;
  user: User;
}

const Home = (userProps: UserProps) => {
  const { isAuthenticated, user } = userProps;

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
          <tr>
            <td style={{ textAlign: "center" }}>1</td>
            <td>Page 1</td>
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
            <td>Page 2</td>
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
            <td>Page 3</td>
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
    </div>
  );
};

export default Home;
