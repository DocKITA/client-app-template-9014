import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
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

import "./style/colors.css";
import "./style/App.css";

import SaaSAuth0 from "./components/auth/SaasAuth0";
import { useAuth0 } from "@auth0/auth0-react";
import { User } from "@auth0/auth0-spa-js";

import { SiGoogleforms } from "react-icons/si";
import {
  MdDashboard,
  MdNotifications,
  MdOutlineAppRegistration,
  MdSettings,
  MdPieChart,
} from "react-icons/md";

type RouteConfig = {
  path: string;
  element: JSX.Element;
  pathKey: string;
};

const Logo = process.env.APPLICATION_LOGO_URL;
const profilePic = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

const Footer = () => {
  return (
    <footer
      style={{
        backgroundColor: process.env.APPLICATION_THEME_COLOR,
        padding: "15px 0",
      }}
    >
      <Container>
        <Row>
          <Col className="text-center text-white">
            {process.env.APPLICATION_FOOTER_CONTENT &&
              process.env.APPLICATION_FOOTER_CONTENT}
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

const App = () => {
  const { isAuthenticated, isLoading, user, logout } = useAuth0();
  const headerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: process.env.APPLICATION_THEME_COLOR,
    padding: "15px 0",
  };

  const logoStyle = {
    height: "40px",
  };

  return (
    <Router>
      <div className="d-flex min-vh-100">
        {/* Content Container */}
        <div
          className="flex-grow-1 d-flex flex-column"
          style={{ backgroundColor: "#f4f4f4" }}
        >
          <Navbar expand="lg" style={headerStyle}>
            <Container fluid>
              <div style={{ display: "flex", alignItems: "center" }}>
                <a href="/">
                  <Image src={Logo} alt="Logo" style={logoStyle} />
                </a>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                {isAuthenticated ? (
                  <>
                    <Image
                      width="40px"
                      src={user.picture}
                      alt="Profile Pic"
                      roundedCircle
                      style={{ marginRight: "10px" }}
                    />
                    <Nav style={{ marginRight: "10px" }}>
                      <NavDropdown
                        title={user.name || "Profile"}
                        id="basic-nav-dropdown"
                      >
                        <NavDropdown.Item href="/profile">
                          Profile
                        </NavDropdown.Item>
                        <NavDropdown.Divider />
                        <NavDropdown.Item onClick={() => logout()}>
                          Logout
                        </NavDropdown.Item>
                      </NavDropdown>
                      <style>
                        {`
                          .dropdown-menu {
                            left: auto !important;
                            right: 0 !important;
                          }
                        `}
                      </style>
                    </Nav>
                  </>
                ) : (
                  <Nav.Link>
                    <SaaSAuth0 />
                  </Nav.Link>
                )}
              </div>
            </Container>
          </Navbar>
          <Container fluid className="p-4">
            {/* content can go here */}
          </Container>
          {process.env.APPLICATION_ALLOW_FOOTER === "true" && (
            <div
              className="footer"
              style={{ position: "fixed", bottom: 0, width: "100%" }}
            >
              <Footer />
            </div>
          )}
        </div>
      </div>
    </Router>
  );
};

export default App;
