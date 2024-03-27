import React, { useEffect, useState } from "react";
import { Link, Route, Routes, useParams, useNavigate } from "react-router-dom";
import NewRecord from "./NewRecord";
import ModifyRecord from "./ModifyRecord";
import FormProgress from "./FormProgress";
import routesData from "./../../../routes.json";
import { Row, Col, Table, Button, Modal, InputGroup, Card, Form } from "react-bootstrap";

interface RouteProps {
    name: string;
    url: string;
    table: string;
    file: string;
    columns_list: string[];
}

interface RecordListProps {
    tableName: string;
    columnList: string[];
}

const Main: React.FC<RecordListProps> = (props) => {
    const navigate = useNavigate();
    const { tableName, columnList } = props;
    const [recordList, setRecordList] = useState([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 10;
    const [showExportModal, setShowExportModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const loadTableData = async () => {
        try {
            console.log(`Send request to backend`);
            const response = await fetch(
                `/api/form/get-record-list/${tableName}?page=${currentPage}&perPage=${itemsPerPage}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.status === 200) {
                const data = await response.json();
                console.log(`Data`, data);
                setRecordList(data.recordList);
            }
        } catch (error) {
            console.error("Error loading data:", error);
        }
    };

    const totalPages = Math.ceil(recordList.length / itemsPerPage);

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const formatDate = (dateString) => {
        const options = {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        };

        const formattedDate = new Intl.DateTimeFormat("en-US", options).format(
            new Date(dateString)
        );
        return formattedDate;
    };

    const handleExport = async () => {
        try {
            const res = await fetch(
                `/api/form/export-page-record/${tableName}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (res.ok) {
                // Handle success, you might want to download the exported file
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");

                // Dynamically set the filename based on record_id
                a.download = `${tableName}.xlsx`;

                a.href = url;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                setShowExportModal(false);
            } else {
                console.error(`Error while exporting record: ${res.status}`);
                setShowExportModal(false);
            }
        } catch (error) {
            console.error(`Error while exporting record: ${error}`);
            setShowExportModal(false);
        }
    };

    const handleSearch = async () => {
        const searchValue = searchQuery;

        try {
            const response = await fetch(
                `/api/form/get-search-list/${tableName}?search=${searchValue}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.status === 200) {
                const data = await response.json();
                console.log(`Data`, data);
                setRecordList(data.recordList);
            }
        } catch (error) {
            console.error("Error loading data:", error);
        }
    }

    useEffect(() => {
        loadTableData();
    }, [currentPage]);


    return (
        <>
            <Row className="justify-content-between">
                <Col xs="auto">
                    <Link to={`/`}>
                        <Button
                            className="float-"
                            variant="outline-light"
                            style={{ backgroundColor: process.env.REACT_APP_APPLICATION_THEME_COLOR }}
                        >
                            Back
                        </Button>
                    </Link>
                </Col>
                <Col xs="auto">
                    <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />

                    <Button
                        onClick={() => setShowExportModal(true)}
                        variant="outline-light"
                        className="float-end me-2"
                        style={{
                            backgroundColor:
                                process.env.REACT_APP_APPLICATION_THEME_COLOR,
                        }}
                    >
                        Export
                    </Button>
                    <Link to={`./create-new`}>
                        <Button
                            variant="outline-light"
                            className="float-end me-2"
                            style={{ backgroundColor: process.env.REACT_APP_APPLICATION_THEME_COLOR }}
                        >
                            New Record
                        </Button>
                    </Link>
                    <Card style={{ width: "30rem", backgroundColor: process.env.REACT_APP_APPLICATION_THEME_COLOR }} className="float-end me-2 ">
                        <InputGroup>
                            <Form.Control
                                type="search"
                                placeholder="Search form"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <Button 
                                onClick={handleSearch}
                                variant="outline-light"
                                style={{backgroundColor: process.env.REACT_APP_APPLICATION_THEME_COLOR}}
                            >
                                Search
                            </Button>
                        </InputGroup>
                    </Card>
                </Col>     
            </Row>
            <Row>
                <Col xs={12}>
                    <Table striped bordered responsive className="mt-2 text-center">
                        <thead style={{ backgroundColor:  process.env.REACT_APP_APPLICATION_THEME_COLOR }}>
                            <tr>
                                {
                                    columnList.length > 0 ? (
                                        columnList.map((item, index) => (
                                            item === 'id' || item === 'date_created' ? <th style={{ width: "150px" }}>{item}</th> : <th>{item}</th>

                                        ))   
                                    ) : (
                                        <>
                                            <th style={{ width: "30%" }}>ID</th>
                                            <th style={{ width: "15%" }}>Date Created</th>
                                        </>
                                    )
                                }
                                <th style={{ width: "2%" }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recordList.map((record, index) => (
                            <tr key={index}>
                                {
                            columnList.length > 0 ? (
                                columnList.map((item, index) => (
                                    item === 'id' || item === 'date_created' ? 
                                    <td style={{ width: "150px", whiteSpace: "nowrap" }} title={item === 'id' ? record[item] : ""}>
                                        {item === 'id' ? (record[item] as string).substring(0, 15) + '...' : new Date(record[item]).toLocaleDateString()}
                                    </td> : 
                                    <td>{record[item]}</td>    
                                ))
                            ) : (
                                <>
                                    <td>{(record.id as string).substring(0, 10) + '...'}</td>
                                    <td>{new Date(record.date_created).toLocaleDateString()}</td>
                                </>
                            )
}
                                <td>
                                    <div style={{ display: 'flex', gap:"12px", justifyContent: 'center' }}>
                    
                                        <Link to={`./r/${record.id}`}>
                                            <Button
                                                variant="outline-light"
                                                style={{ backgroundColor: process.env.REACT_APP_APPLICATION_THEME_COLOR }}
                                            >
                                                View
                                            </Button>
                                        </Link>
                                        <Link to={`./r/progress`}>
                                        <Button 
                                            variant="outline-light" 
                                            className="float-end"
                                            style={{backgroundColor: process.env.REACT_APP_APPLICATION_THEME_COLOR,}}
                                        >
                                            Progress
                                        </Button>
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>
                </Col>

                <Modal
                    show={showExportModal}
                    onHide={() => setShowExportModal(false)}
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Export as excel file</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>Export {tableName}?</Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowExportModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={handleExport}>
                            Confirm
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Row>
        </>
    );
};

const Pagination: React.FC<{
    currentPage: number;
    totalPages: number;
    onPageChange: (pageNumber: number) => void;
}> = ({ currentPage, totalPages, onPageChange }) => {
    return (
        <div className="pagination float-end ">
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

const FormRecordList = () => {
    const { form_list_url } = useParams();
    const [routeProps, setRouteProps] = useState<RouteProps>();

    useEffect(() => {
        const similarForm = routesData["form-list"].find(
            (form) => form.url === form_list_url
        );
        if (similarForm) {
            console.log(similarForm);
            setRouteProps({
                name: similarForm.name,
                url: similarForm.url,
                table: similarForm.table,
                file: similarForm.file,
                columns_list: similarForm.columns_list as string[]
            });
        }
    }, []);

    return (
        <Routes>
            {
                routeProps && (
                    <>
                        <Route path="/" element={<Main tableName={routeProps.table} columnList={routeProps.columns_list} /> }/>
                        <Route path="/create-new" element={ <NewRecord fileName={routeProps.file} tableName={routeProps.table} /> } />
                        <Route path="/r/:record_id" element={ <ModifyRecord fileName={routeProps.file} tableName={routeProps.table} /> } />
                        <Route path="/r/progress" element={ <FormProgress fileName={routeProps.file} tableName={routeProps.table} /> } />
                    </>
                )
            }
        </Routes>
    );
};

export default FormRecordList;
