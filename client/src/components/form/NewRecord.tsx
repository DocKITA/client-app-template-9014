import { useEffect, useRef, useState } from "react";
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
    Nav,
    Dropdown,
    NavDropdown,
    Accordion,
    Button,
    Offcanvas,
    Spinner,
} from "react-bootstrap";
import { useAuth0 } from "@auth0/auth0-react";
import { fabric } from "fabric";
import { FaChevronLeft } from "react-icons/fa";
import { FaChevronRight } from "react-icons/fa";

interface FormProps {
    fileName: string;
}

interface CanvasPage {
    version: string;
    objects: fabric.Object[];
}

interface FabricCanvasProps {
    pages: CanvasPage[];
}

interface Page {
    id: number;
    canvasJSON: JSON;
}

const NewRecord: React.FC<FormProps> = (props) => {
    const { fileName } = props;
    const { user } = useAuth0();
    const navigate = useNavigate();

    const [fabricCanvas, setFabricCanvas] = useState();
    const [canvasJSON, setCanvasJSON] = useState(null);
    const [selectedElementID, setSelectedElementID] = useState();
    const [pages, setPages] = useState<Page[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [isPanningMode, setIsPanningMode] = useState<boolean>(false);
    const [canvasChanged, setCanvasChanged] = useState<boolean>(false);

    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const isPanningModeRef = useRef(isPanningMode);
    const zoomInRef = useRef(null);
    const zoomOutRef = useRef(null);
    const panRef = useRef(null);
    
    fabric.Textbox.prototype.toObject = (function(toObject) {
        return function() {
            return fabric.util.object.extend(toObject.call(this), {
                fx: this.fx,
                id: this.id
            });
        };
    })(fabric.Textbox.prototype.toObject);

    fabric.Rect.prototype.toObject = (function(toObject) {
    return function() {
        return fabric.util.object.extend(toObject.call(this), {
            fx: this.fx,
            id: this.id
        });
    };
    })(fabric.Rect.prototype.toObject);

    fabric.Circle.prototype.toObject = (function(toObject) {
    return function() {
        return fabric.util.object.extend(toObject.call(this), {
            fx: this.fx,
            id: this.id
        });
    };
    })(fabric.Circle.prototype.toObject);

    fabric.Group.prototype.toObject = (function(toObject) {
    return function() {
        return fabric.util.object.extend(toObject.call(this), {
            fx: this.fx,
            id: this.id
        });
    };
    })(fabric.Group.prototype.toObject);

    const saveAndLoadPage = (newPageIndex: number) => {
        const currentPageData = fabricCanvas.toJSON();
        const updatedPages = [...pages];
        updatedPages[currentPage] = {
            id: currentPage,
            canvasJSON: currentPageData
        };

        setPages(updatedPages);
        setCurrentPage(newPageIndex);
        fabricCanvas.clear();
        const newPageData = updatedPages[newPageIndex].canvasJSON;
        fabricCanvas.loadFromJSON(newPageData, () => {
            const background = fabricCanvas.getObjects().find((obj) => obj.type === "image");
            if (background) {
                background.set({
                    lockMovementX: true,
                    lockMovementY: true,
                    lockScalingX: true,
                    lockScalingY: true,
                    lockRotation: true,
                    selectable: false,
                    evented: false,
                });
            }

            fabricCanvas.renderAll();
        });
    };

    const handlePageChange = (index: number) => {
        if (index + 1 <= pages.length && index >= 0) {
            saveAndLoadPage(index);
        }
    };

    const handleNextPage = () => {
        if (currentPage + 1 < pages.length) {
            setCurrentPage(currentPage + 1);
            saveAndLoadPage(currentPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
            saveAndLoadPage(currentPage - 1);
        }
    };

    const handleSaveToJSON = () => {
        if (fabricCanvas) {
            const canvasObjects = fabricCanvas.getObjects();
            const objectsWithIDs = canvasObjects.map((obj) => ({
                id: obj.id,
                ...obj.toJSON()
            }));

            const canvasJSONcode = {
                objects: objectsWithIDs,
                background: fabricCanvas.backgroundColor,
                width: fabricCanvas.width,
                height: fabricCanvas.height,
            }
        }
    };

    useEffect(() => {
        const extractJSONFile = async () => {
            try {
                const res = await fetch(`./../../../form/${fileName}.json`);

                if (!res.ok) {
                    throw new Error(`Failed to load template`);
                }
    
                const data = await res.json();
                
                // Load data from client
                if (data && data.length > 0) {

                    const newPages = [];
                    for (let i = 0; i < data.length; i++) {
                        const pageData = {
                            "id": i,
                            "canvasJSON": data[i]
                        };
                        newPages.push(pageData);
                    }
                    
                    // Initiate a new Canvas
                    const canvas = new fabric.Canvas(canvasRef.current, {
                        width: newPages[0].canvasJSON.objects[0].width,
                        height: newPages[0].canvasJSON.objects[0].height
                    });

                    setFabricCanvas(canvas);
    
                    // Update the state with the combined array of previous pages and new pages
                    setPages((prevPages) => [...prevPages, ...newPages]);
                }
            } catch (error) {
                console.error("Error loading JSON file:", error);
            }
        };
    
        extractJSONFile();
    }, [fileName]);
    
    useEffect(() => {
        // Display the updated pages array
        console.log(`Pages ${currentPage}: `, pages[currentPage]);
    }, [pages]);

    useEffect(() => {
        isPanningModeRef.current = isPanningMode;
    }, [isPanningMode]);

    useEffect(() => {
        const handleCanvasChanges = () => {
            setCanvasChanged(true);
        };
    
        if (fabricCanvas) {
            fabricCanvas.on("object:modified", handleCanvasChanges);
            fabricCanvas.on("object:added", handleCanvasChanges);
            fabricCanvas.on("object:removed", handleCanvasChanges);
            fabricCanvas.on("mouse:up", handleCanvasChanges);
        }
    
        return () => {
            if (fabricCanvas) {
                fabricCanvas.off("object:modified", handleCanvasChanges);
                fabricCanvas.off("object:added", handleCanvasChanges);
                fabricCanvas.off("object:removed", handleCanvasChanges);
                fabricCanvas.off("mouse:up", handleCanvasChanges);
            }
        };
    }, [fabricCanvas]);

    // Effect to perform auto-save when canvas changes
    useEffect(() => {
        if (canvasChanged) {
            handleSaveToJSON();
            setCanvasChanged(false);
        }
    }, [canvasChanged, handleSaveToJSON]);

    return (
        <Row>
            <Col>
                <Row>
                    <Col>
                        <Button
                            variant="outline-light"
                            style={{
                                backgroundColor:
                                    process.env
                                        .REACT_APP_APPLICATION_THEME_COLOR,
                            }}
                        >
                            Cancel
                        </Button>
                    </Col>
                    <Col className="text-center">
                        <Button
                            onClick={handlePreviousPage}
                            variant="outline-light"
                            size="sm"
                            className="px-4 m-2 rounded-pill"
                            style={{
                            backgroundColor: process.env.REACT_APP_APPLICATION_THEME_COLOR,
                            }}
                        >
                            <FaChevronLeft size={25} />
                        </Button>
                        {currentPage + 1} / {pages.length}
                        <Button
                            onClick={handleNextPage}
                            variant="outline-light"
                            size="sm"
                            className="px-4 m-2 rounded-pill"
                            style={{
                            backgroundColor: process.env.REACT_APP_APPLICATION_THEME_COLOR,
                            }}
                        >
                            <FaChevronRight size={25} />
                        </Button>
                    </Col>
                    <Col>
                        <Button
                            variant="outline-light"
                            className="float-end"
                            style={{
                                backgroundColor:
                                    process.env
                                        .REACT_APP_APPLICATION_THEME_COLOR,
                            }}
                        >
                            Save
                        </Button>
                    </Col>
                </Row>
                <Row style={{ height: "75vh"}}>
                    <Col className="overflow-auto w-100">
                        <canvas className="" id="canvasRef" ref={canvasRef} />
                    </Col>
                </Row>
            </Col>
        </Row>
    )
}

export default NewRecord