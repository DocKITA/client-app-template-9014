import React, { useEffect, useState } from "react";
import { User } from "@auth0/auth0-spa-js";
import { Route, Routes, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { Col, Row, Button, Table } from "react-bootstrap";

interface UserProps {
  isAuthenticated: boolean;
  user: User;
}

const Main = () => {
  const { isAuthenticated, user } = useAuth0();
  const [routesData, setRoutesData] = useState<any>();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  const handleViewClick = (url: string) => {
    navigate(`/f/${url}`);
  };

  useEffect(() => {
    const checkRoutesFile = async () => {
      try {
        const response = await fetch("./../routes.json");
        const data = await response.json();
        setRoutesData(data);
      } catch (error) {
        console.error("Error reading routes json: ", error);
      }
    };

    checkRoutesFile();
  }, []);

  const totalPages = Math.ceil(
    (routesData?.["form-list"]?.length || 0) / itemsPerPage
  );

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const visibleItems =
    routesData?.["form-list"]?.slice(startIndex, endIndex) || [];

  return (
    <div>
      <Row className="justify-content-end">
        <Col xs="auto">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </Col>
      </Row>
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
          {visibleItems.map((form, index) => (
            <tr key={index}>
              <td style={{ textAlign: "center" }}>{startIndex + index + 1}</td>
              <td>{form.name}</td>
              <td style={{ textAlign: "center" }}>
                <Button
                  variant="outline-light"
                  style={{
                    backgroundColor:
                      process.env.REACT_APP_APPLICATION_THEME_COLOR,
                  }}
                  onClick={() => handleViewClick(form.url)}
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
};

const Pagination: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (pageNumber: number) => void;
}> = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="pagination">
      <ul className="pagination-list list-unstyled d-flex">
        <li className="page-item">
          <Button
            onClick={() => onPageChange(currentPage - 1)}
            className="page-link"
            disabled={currentPage === 1}
          >
            {"<"}
          </Button>
        </li>
        <li className="page-item">
          <Button
            onClick={() => onPageChange(currentPage)}
            className="page-link"
            disabled
          >
            {`${currentPage}`}
          </Button>
        </li>
        <li className="page-item">
          <Button
            onClick={() => onPageChange(currentPage + 1)}
            className="page-link"
            disabled={currentPage === totalPages}
          >
            {">"}
          </Button>
        </li>
      </ul>
    </div>
  );
};

const Home = () => {
  return (
    <Routes>
      <Route path="/" element={<Main />} />
    </Routes>
  );
};

export default Home;
