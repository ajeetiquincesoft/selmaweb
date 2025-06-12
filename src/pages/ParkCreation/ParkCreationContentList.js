import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Card, Col, CardBody, Row, Button, Modal, ModalHeader, ModalBody,
  Container, Alert
} from "reactstrap";
import axios from "axios";
import BASE_URL from "path"; // Replace with actual BASE_URL
import "../../custom.css";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

const initialFormData = {
  image: null,
  mission: "",
  vision: "",
  address: "",
  hours: "",
  contacts: "",
  status: ""
};

const ParkCreationContent = () => {
  const [modal, setModal] = useState(false);
  const [token, setToken] = useState(null);
  const [content, setContent] = useState([]);
  const [errors, setErrors] = useState({});
  const [alertMsg, setAlertMsg] = useState({ type: "", message: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    const storedUser = localStorage.getItem("authUser");
    if (storedUser) {
      setToken(JSON.parse(storedUser).token);
    }
  }, []);

  useEffect(() => {
    if (token) fetchContent(currentPage);
  }, [token, currentPage]);

  const fetchContent = async (page = 1) => {
    try {
      const res = await axios.get(`${BASE_URL}/auth/getparksandrecreationcontent`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 1, page, status: 'all' }
      });

      // Save only the first item of the data array
      setContent(res.data.data?.[0] || {});

      setCurrentPage(res.data.pagination.currentPage);
      setTotalPages(res.data.pagination.totalPages);
    } catch (err) {
      console.error("Failed to fetch data", err);
    }
  };

  const toggleModal = () => setModal(!modal);

  const handleChange = (e) => {
    const { name, value, files, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));
  };

  const validate = () => {
    const requiredFields = ["image", "mission", "vision", "address", "hours", "contacts", "status"];
    const newErrors = {};
    requiredFields.forEach(field => {
      if (!formData[field]) newErrors[field] = `${field} is required`;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value));

    try {
      await axios.post(`${BASE_URL}/auth/addparksandrecreationcontent`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      setAlertMsg({ type: "success", message: "Content added successfully!" });
      fetchContent(currentPage);
      setTimeout(() => {
        setFormData(initialFormData);
        setModal(false);
        setAlertMsg({ type: "", message: "" });
      }, 2000);
    } catch (error) {
      console.error("API error:", error);
      setAlertMsg({ type: "danger", message: "Something went wrong!" });
    }
  };

  const stripHtml = (html) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  };

  return (
    <div className="page-content">
      <Container fluid>
        <Row className="justify-content-between mb-3">
          <Col xs="auto">
            <ul className="breadcrumb">
              <li>
                <Link to="/"><a href="/">Home /</a></Link>
              </li>
              <li className="active">Parks & Recreation Content</li>
            </ul>
          </Col>
          <Col xs="auto">
            <Button color="primary" onClick={toggleModal}>
              <i className={`mdi ${content ? 'mdi-pencil' : 'mdi-plus'} me-1`}></i>
              {content ? 'Update Content' : 'Add Content'}
            </Button>
          </Col>
        </Row>

        {console.log(content)}
        <Row>
          <Col lg={12}>
            <Card>
              <CardBody>
                <div className="pt-3">
                  <Row className="justify-content-center">
                    <Col xl={8}>
                      <div>
                        <div className="text-center">
                          <div className="mb-4">
                            <Link
                              to="#"
                              className="badge bg-light font-size-12"
                            >
                              <i className="bx bx-purchase-tag-alt align-middle text-muted me-1"></i>
                              Parks & Recreation Content
                            </Link>
                          </div>
                          <h4>{content.title}</h4>
                          <p className="text-muted mb-4">
                            <div dangerouslySetInnerHTML={{ __html: content.mission }} />
                          </p>
                        </div>

                        <hr />
                        <div className="text-center">
                          <Row>
                            <Col sm={4}>
                              <div>
                                <p className="text-muted mb-2">address</p>
                                <h5 className="font-size-15">{content.address}</h5>
                              </div>
                            </Col>
                            <Col sm={4}>
                              <div className="mt-4 mt-sm-0">
                                <p className="text-muted mb-2">hours</p>
                                <h5 className="font-size-15">
                                  {content.hours}
                                </h5>
                              </div>
                            </Col>
                            <Col sm={4}>
                              <div className="mt-4 mt-sm-0">
                                <p className="text-muted mb-2">Contacts</p>
                                <h5 className="font-size-15">{content.contacts}</h5>
                              </div>
                            </Col>
                          </Row>
                        </div>
                        <hr />

                        <div className="my-5">
                          <img
                            src={content.image}
                            alt=""
                            className="img-thumbnail mx-auto d-block"
                          />
                        </div>


                        <hr />

                        <div className="mt-4">
                          <div className="">

                            <div dangerouslySetInnerHTML={{ __html: content.vision }} />
                          </div>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>


        {/* Modal */}
        <Modal isOpen={modal} toggle={toggleModal} size="lg">
          <ModalHeader toggle={toggleModal}>Add Park & Recreation</ModalHeader>
          <ModalBody>
            <form onSubmit={handleSubmit}>
              <Container fluid>
                <Row>
                  <Col lg={12}>
                    {alertMsg.message && (
                      <Alert color={alertMsg.type}>{alertMsg.message}</Alert>
                    )}
                  </Col>

                  {[
                    { label: "Image", name: "image", type: "file" },
                    { label: "Address", name: "address", type: "text" },
                    { label: "Hours", name: "hours", type: "text" },
                    { label: "Contacts", name: "contacts", type: "text" },
                  ].map(({ label, name, type }) => (
                    <Col lg={12} className="mt-3" key={name}>
                      <label className="form-label">{label}</label>
                      <input
                        className="form-control"
                        type={type}
                        name={name}
                        onChange={handleChange}
                      />
                      {errors[name] && <span className="text-danger">{errors[name]}</span>}
                    </Col>
                  ))}

                  <Col lg={12} className="mt-3">
                    <label className="form-label">Mission</label>
                    <CKEditor
                      editor={ClassicEditor}
                      data={formData.mission}
                      onChange={(event, editor) => {
                        const data = editor.getData();
                        setFormData(prev => ({ ...prev, mission: data }));
                      }}
                    />
                    {errors.mission && <span className="text-danger">{errors.mission}</span>}
                  </Col>

                  <Col lg={12} className="mt-3">
                    <label className="form-label">Vision</label>
                    <CKEditor
                      editor={ClassicEditor}
                      data={formData.vision}
                      onChange={(event, editor) => {
                        const data = editor.getData();
                        setFormData(prev => ({ ...prev, vision: data }));
                      }}
                    />
                    {errors.vision && <span className="text-danger">{errors.vision}</span>}
                  </Col>

                  <Col lg={12} className="mt-3">
                    <label className="form-label">Status</label>
                    <select
                      className="form-control"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                    >
                      <option value="">Select Status</option>
                      <option value="0">Unpublished</option>
                      <option value="2">Draft</option>
                      <option value="1">Published</option>
                    </select>
                    {errors.status && <span className="text-danger">{errors.status}</span>}
                  </Col>

                  <Col lg={12} className="mt-4 text-center">
                    <Button type="submit" color="primary">Submit</Button>
                  </Col>
                </Row>
              </Container>
            </form>
          </ModalBody>
        </Modal>
      </Container>
    </div>
  );
};

export default ParkCreationContent;
