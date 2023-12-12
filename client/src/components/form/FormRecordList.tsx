import React, { useEffect, useState } from "react";
import { Link, Route, Routes, useParams } from "react-router-dom";
import NewRecord from "./NewRecord";
import ModifyRecord from "./ModifyRecord";
import routesData from "./../../../routes.json";
import { Row, Col, Table, Button } from "react-bootstrap";

interface RouteProps {
    name: string;
    url: string;
    table: string;
    file: string;
}

interface RecordListProps {
    tableName: string;
}

const Main: React.FC<RecordListProps> = (props) => {
    const { tableName } = props;
    const [recordList, setRecordList] = useState();

    const loadTableData = async () => {
        try {
            console.log(`Send request to backend`)
            const response = await fetch(`/api/form/get-record-list/${tableName}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (response.status === 200) {
                const data = await response.json();
                console.log(`Data`, data);
                setRecordList(data.recordList);
            }
        } catch (error) {
            console.error("Error loading data:", error);
        }
        return;
    };

    useEffect(() => {
        loadTableData();
    }, []);

    return (
        <Row>
            <Col>
                <Link to={`./create-new`}>
                    <Button
                        variant="outline-light"
                        style={{
                            backgroundColor:
                                process.env
                                    .REACT_APP_APPLICATION_THEME_COLOR,
                        }}
                    >
                        New Record
                    </Button>
                </Link>
                
                <Table striped bordered responsive className="mt-2 text-center">
                    <thead
                        style={{
                            backgroundColor:
                                process.env.REACT_APP_APPLICATION_THEME_COLOR,
                        }}
                    >
                        <tr>
                            <th style={{ width: "30%" }}>ID</th>
                            <th style={{ width: "15%" }}>Date Created</th>
                            <th style={{ width: "2%" }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            recordList && recordList.map(record => (
                                <tr key={record.id}>
                                    <td>{record.id}</td>
                                    <td>{record.date_created}</td>
                                    <td>
                                        <Link to={`./r/${record.id}`}>
                                            <Button
                                                variant="outline-light"
                                                style={{
                                                    backgroundColor:
                                                        process.env
                                                            .REACT_APP_APPLICATION_THEME_COLOR,
                                                }}
                                            >
                                                View
                                            </Button>
                                        </Link>
                                        
                                    </td>
                                </tr>
                            ))
                        }
                    </tbody>
                </Table>
            </Col>
        </Row>
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
                file: similarForm.file
            });
        }
    }, []);

    return (
        <Routes>
            {routeProps && (
                <>
                    <Route path="/" element={<Main tableName={routeProps.table} />} />
                    <Route path="/create-new" element={<NewRecord fileName={routeProps.file} tableName={routeProps.table} />} />
                    <Route path="/r/:record_id" element={<ModifyRecord fileName={routeProps.file} tableName={routeProps.table} />} />
                </>
            )}
        </Routes>
    );
};

export default FormRecordList;
