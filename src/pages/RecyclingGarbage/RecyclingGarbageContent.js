import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Card, Col, CardBody, Row, Button, Modal, ModalHeader, ModalBody,
  Container, Alert
} from "reactstrap";
import axios from "axios";
import BASE_URL from "path"; // Replace with your actual BASE_URL
import "../../custom.css";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

const initialFormData = {
  image: null,
  description: "",
  shortdescription: "",
  status: ""
};

const RecyclingGarbageContent = () => {
  const [modal, setModal] = useState(false);
  const [token, setToken] = useState(null);
  const [content, setContent] = useState({});
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
      const res = await axios.get(`${BASE_URL}/auth/getRecyclingAndGarbageContent`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 1, page, status: 'all' }
      });
      console.log(res.data);
      setContent(res.data.data || {});
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
    const requiredFields = ["image", "description", "shortdescription", "status"];
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
      await axios.post(`${BASE_URL}/auth/addrecyclinggarbagecontent`, data, {
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

  return (
    <div className="page-content">

      <Container fluid>
        <Row className="justify-content-between mb-3">
          <Col xs="auto">
            <ul className="breadcrumb">
              <li>
                <Link to="/"><a href="/">Home /</a></Link>
              </li>
              <li className="active">Recycling & Garbage Content</li>
            </ul>
          </Col>
          <Col xs="auto">
            <Button color="primary" onClick={toggleModal}>
              <i className={`mdi ${content ? 'mdi-pencil' : 'mdi-plus'} me-1`}></i>
              {content ? 'Update Content' : 'Add Content'}
            </Button>
          </Col>
        </Row>

        <Row>
          <Col lg={12}>
            <Card>
              <CardBody>
                <div className="pt-3">
                  <Row className="justify-content-center">
                    <Col xl={8}>
                      <div className="text-center">
                        <div className="mb-4">
                          <Link to="#" className="badge bg-light font-size-12">
                            <i className="bx bx-recycle align-middle text-muted me-1"></i>
                            Recycling & Garbage Content
                          </Link>
                        </div>
                        <h4>{content.shortdescription}</h4>
                        <div className="my-5">
                          <img
                            src={content.image}
                            alt=""
                            className="img-thumbnail mx-auto d-block"
                          />
                        </div>
                      </div>

                      <hr />

                      <div className="text-muted mb-4" dangerouslySetInnerHTML={{ __html: content.description }} />
                    </Col>
                  </Row>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Modal */}
        <Modal isOpen={modal} toggle={toggleModal} size="lg">
          <ModalHeader toggle={toggleModal}>Add Recycling & Garbage Content</ModalHeader>
          <ModalBody>
            <form onSubmit={handleSubmit}>
              <Container fluid>
                <Row>
                  <Col lg={12}>
                    {alertMsg.message && (
                      <Alert color={alertMsg.type}>{alertMsg.message}</Alert>
                    )}
                  </Col>

                  {[{ label: "Image", name: "image", type: "file" },
                  { label: "Short Description", name: "shortdescription", type: "text" },
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
                    <label className="form-label">Description</label>
                    <CKEditor
                      editor={ClassicEditor}
                      data={formData.description}
                      onChange={(event, editor) => {
                        const data = editor.getData();
                        setFormData(prev => ({ ...prev, description: data }));
                      }}
                    />
                    {errors.description && <span className="text-danger">{errors.description}</span>}
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

export default RecyclingGarbageContent;
