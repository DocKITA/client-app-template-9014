import { useEffect, useRef, useState } from "react";
import { Link, Route, Routes, useNavigate, useParams } from "react-router-dom";
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
  Alert,
  Modal,
} from "react-bootstrap";
import { useAuth0 } from "@auth0/auth0-react";
import { fabric } from "fabric";
import { FaChevronLeft } from "react-icons/fa";
import { FaChevronRight } from "react-icons/fa";

interface FormProps {
  fileName: string;
  tableName: string;
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

const ModifyRecord: React.FC<FormProps> = (props) => {
  const { fileName, tableName } = props;
  const { record_id } = useParams();
  const { user } = useAuth0();
  const navigate = useNavigate();
  const { form_list_url } = useParams<{ form_list_url: string }>();

  const [fabricCanvas, setFabricCanvas] = useState();
  const [pages, setPages] = useState<Page[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [canvasChanged, setCanvasChanged] = useState<boolean>(false);

  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [record, setRecord] = useState<any>(null);
  const [extractStatus, setExtractStatus] = useState<boolean>(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const canvasRef = useRef(null);

  fabric.Textbox.prototype.toObject = (function (toObject) {
    return function () {
      return fabric.util.object.extend(toObject.call(this), {
        fx: this.fx,
        id: this.id,
      });
    };
  })(fabric.Textbox.prototype.toObject);

  fabric.Rect.prototype.toObject = (function (toObject) {
    return function () {
      return fabric.util.object.extend(toObject.call(this), {
        fx: this.fx,
        id: this.id,
      });
    };
  })(fabric.Rect.prototype.toObject);

  fabric.Circle.prototype.toObject = (function (toObject) {
    return function () {
      return fabric.util.object.extend(toObject.call(this), {
        fx: this.fx,
        id: this.id,
      });
    };
  })(fabric.Circle.prototype.toObject);

  fabric.Group.prototype.toObject = (function (toObject) {
    return function () {
      return fabric.util.object.extend(toObject.call(this), {
        fx: this.fx,
        id: this.id,
      });
    };
  })(fabric.Group.prototype.toObject);

  const saveAndLoadPage = (newPageIndex: number) => {
    const currentPageData = fabricCanvas.toJSON();
    const updatedPages = [...pages];
    updatedPages[currentPage] = {
      id: currentPage,
      canvasJSON: currentPageData,
    };

    setPages(updatedPages);
    setCurrentPage(newPageIndex);
    fabricCanvas.clear();
    const newPageData = updatedPages[newPageIndex].canvasJSON;
    fabricCanvas.loadFromJSON(newPageData, () => {
      const background = fabricCanvas
        .getObjects()
        .find((obj) => obj.type === "image");
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
        ...obj.toJSON(),
      }));

      const canvasJSONcode = {
        objects: objectsWithIDs,
        background: fabricCanvas.backgroundColor,
        width: fabricCanvas.width,
        height: fabricCanvas.height,
      };
    }
  };

  const handleSave = async () => {
    const currentPageData = fabricCanvas.toJSON();
    const updatedPages = [...pages];
    updatedPages[currentPage] = {
      id: currentPage,
      canvasJSON: currentPageData,
    };

    setPages(updatedPages);
    const jsonData = [];

    const extractProperties = (canvasJSON) => {
      const extractedData = [];
      canvasJSON.objects.forEach((obj) => {
        if (obj.fx && obj.id && obj.text) {
          const extractedObj = {
            fx: obj.fx || null,
            id: obj.id || null,
            text: obj.text || null,
            type: obj.type || null,
          };
          extractedData.push(extractedObj);
        }
      });

      return extractedData;
    };

    updatedPages.forEach((page) => {
      const extractedData = extractProperties(page.canvasJSON);
      jsonData.push(extractedData);
    });

    const flattenedData = jsonData.flat();

    // Implement a function to extract JSON Objects .fx .id .text .type

    try {
      const res = await fetch(`/api/form/update-record`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          table: tableName,
          data: flattenedData,
          id: record_id,
        }),
      });

      if (res.ok) {
        setSavedSuccess(true);
      } else {
        console.error(`Error while updating record: ${res.status}`);
      }
    } catch (error) {
      console.error(`Error while updating record: ${error}`);
    }
  };

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

        // Load all JSON object into canvas
        for (let i = 0; i < data.length; i++) {
          const pageData = {
            id: i,
            canvasJSON: data[i],
          };

          pageData.canvasJSON.objects.forEach((obj) => {
            if (obj.fx === "input" && obj.id && record) {
              const recordField = record[obj.id];
              if (recordField !== undefined) {
                obj.text = recordField; // Replace the text content
              }
            }
          });

          newPages.push(pageData);
        }

        // Initiate a new Canvas
        const canvas = new fabric.Canvas(canvasRef.current, {
          width: newPages[0].canvasJSON.objects[0].width,
          height: newPages[0].canvasJSON.objects[0].height,
          selection: false,
        });

        canvas.loadFromJSON(newPages[0].canvasJSON, () => {
          // Callback function to execute after JSON is loaded
          const background = canvas
            .getObjects()
            .find((obj) => obj.type === "image");
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

          canvas.renderAll();
        });

        newPages[0].canvasJSON.objects.forEach((obj) => {
          if (obj.fx === "input") {
            obj.lockMovementX = true;
            obj.lockMovementY = true;
            obj.lockScalingX = true;
            obj.lockScalingY = true;
            obj.lockRotation = true;
            obj.lockUniScaling = true;
            obj.lockFlip = true;
            obj.hasControls = false;

            canvas.on("mouse:down", (event) => {
              const target = event.target;
              if (target && target.fx === "input") {
                canvas.discardActiveObject();
                target.enterEditing();
              }
            });
            canvas.renderAll();
          }
        });

        setFabricCanvas(canvas);

        // Update the state with the combined array of previous pages and new pages
        setPages((prevPages) => [...prevPages, ...newPages]);

        saveAndLoadPage(0);
      }
    } catch (error) {
      console.error("Error loading JSON file:", error);
    }
  };

  if (extractStatus) {
    extractJSONFile();
    setExtractStatus(false);
  }

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/form/delete-record`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: record_id,
          table: tableName,
        }),
      });

      if (res.ok) {
        window.alert("Delete Successfully");
        setShowDeleteModal(false);
        navigate(`/f/${form_list_url}`);
      } else {
        window.alert("Delete Failed");
        console.error(`Error while deleting record: ${res.status}`);
      }
    } catch (error) {
      window.alert("Delete Failed");
      console.error(`Error while deleting record: ${error}`);
    }
  };

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const res = await fetch("/api/form/get-record", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            record_id,
            table: tableName,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          console.log("Fetched Record:", data.record);
          setRecord(data.record);
          setExtractStatus(true);
        } else {
          console.error("Failed to fetch record");
        }
      } catch (error) {
        console.error("Error while fetching record:", error);
      }
    };
    fetchRecord();
  }, [fileName]);

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
            <Link to={`/f/${form_list_url}`}>
              <Button
                variant="outline-light"
                style={{
                  backgroundColor:
                    process.env.REACT_APP_APPLICATION_THEME_COLOR,
                }}
              >
                {savedSuccess ? "Return" : "Cancel"}
              </Button>
            </Link>
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
              onClick={() => setShowDeleteModal(true)}
              variant="outline-light"
              className="float-end"
              style={{
                backgroundColor: process.env.REACT_APP_APPLICATION_THEME_COLOR,
              }}
            >
              Delete
            </Button>
            <Button
              onClick={handleSave}
              variant="outline-light"
              className="float-end"
              style={{
                backgroundColor: process.env.REACT_APP_APPLICATION_THEME_COLOR,
              }}
              disabled={savedSuccess}
            >
              Save
            </Button>
          </Col>

          <Modal
            show={showDeleteModal}
            onHide={() => setShowDeleteModal(false)}
          >
            <Modal.Header closeButton>
              <Modal.Title>Confirm Deletion</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              Are you sure you want to delete this record?
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                Delete
              </Button>
            </Modal.Footer>
          </Modal>
        </Row>
        <Row className="mx-auto " style={{ width: "95vw", height: "75vh" }}>
          <Col className="overflow-auto h-100 w-100">
            <canvas
              className=""
              id="canvasRef"
              ref={canvasRef}
              style={{ cursor: "default" }}
            />
          </Col>
        </Row>

        {savedSuccess && (
          <Alert
            variant="success"
            className="position-absolute bottom-0 end-0 m-3"
            onClose={() => {
              navigate(`/f/${form_list_url}`);
            }}
            dismissible
          >
            Changes Saved{" "}
            <Alert.Link href={`/f/${form_list_url}`}>
              Back to Record List
            </Alert.Link>
          </Alert>
        )}
      </Col>
    </Row>
  );
};

export default ModifyRecord;
