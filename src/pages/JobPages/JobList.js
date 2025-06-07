import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  Col,
  Row,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  Container,
  Alert
} from "reactstrap";
import classnames from "classnames";
import axios from "axios";
import BASE_URL from "path"; // Replace with your actual BASE_URL import
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import "../../custom.css";

const JobList = () => {
  const [modal, setModal] = useState(false);
  const [token, setToken] = useState(null);
  const [categories, setCategories] = useState([]);
  const [getjob, setJob] = useState([]);
  const [errors, setErrors] = useState({});
  const [alertMsg, setAlertMsg] = useState({ type: "", message: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    shortdescription: "",
    featured_image: null,
    images: [],
    category_id: "",
    status: "",
    link: "",
    apply_link: ""
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("authUser");
    if (storedUser) {
      const { token } = JSON.parse(storedUser);
      setToken(token);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchCategories();
      fetchJobdata(currentPage);
    }
  }, [token, currentPage]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/auth/getalljobcategory`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(response.data.data || []);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  };

  const fetchJobdata = async (page = 1) => {
    try {
      const response = await axios.get(`${BASE_URL}/auth/getalljobs?status=all`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 15, page: page },
      });
      setJob(response.data.data || []);
      setCurrentPage(response.data.pagination.currentPage);
      setTotalPages(response.data.pagination.totalPages);
    } catch (err) {
      console.error("Failed to fetch jobs", err);
    }
  };

  const stripHtml = (html) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  };

  const toggleModal = () => setModal(!modal);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "file"
        ? name === "images"
          ? files
          : files[0]
        : value,
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title) newErrors.title = "Title is required";
    if (!formData.description) newErrors.description = "Description is required";
    if (!formData.shortdescription) newErrors.shortdescription = "Short description is required";
    if (!formData.featured_image) newErrors.featured_image = "Featured image is required";
    if (!formData.link) newErrors.link = "Link is required";
    if (!formData.apply_link) newErrors.apply_link = "Apply link is required";
    if (!formData.category_id) newErrors.category_id = "Category is required";
    if (!formData.status) newErrors.status = "Status is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const today = new Date().toISOString().split("T")[0];
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value));
    data.append("published_at", today);

    try {
      await axios.post(`${BASE_URL}/auth/addjob`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      setAlertMsg({ type: "success", message: "Job added successfully!" });
      fetchJobdata(currentPage);
      setTimeout(() => {
        setFormData({
          title: "",
          description: "",
          shortdescription: "",
          featured_image: null,
          images: [],
          category_id: "",
          status: "",
          link: "",
          apply_link: ""
        });
        setModal(false);
        setAlertMsg({ type: "", message: "" });
      }, 2000);
    } catch (error) {
      console.error("API error:", error);
      setAlertMsg({ type: "danger", message: "Something went wrong!" });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this job?")) {
      try {
        await axios.post(`${BASE_URL}/auth/deletejob`, { id }, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        fetchJobdata(currentPage);
      } catch (error) {
        console.error("Error deleting job:", error);
      }
    }
  };

  return (
    <div className="page-content">
      <Container fluid>
        <Row className="justify-content-between mb-3">
          <Col xs="auto"><h4>Job List</h4></Col>
          <Col xs="auto">
            <Button color="primary" onClick={toggleModal}>
              <i className="mdi mdi-plus me-1"></i> Add Job
            </Button>
          </Col>
        </Row>

        <Row>
          {getjob.map((item, index) => (
            <Col key={index} sm={4} md={4} lg={4}>
              <Card className="p-1 border shadow-none">
                <div className="p-3">
                  <h5>
                    <Link to={`/job-details/${item.id}`} className="text-dark">
                      {item.title}
                    </Link>
                  </h5>
                  <p className="text-muted mb-0">
                    {new Date(item.createdAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>

                <div className="position-relative">
                  <img
                    src={item.featured_image || "default.jpg"}
                    alt={item.title}
                    className="img-thumbnail fixed-size-img"
                  />
                </div>

                <div className="p-3">
                  <ul className="list-inline d-flex justify-content-between">
                    <li className="list-inline-item me-3">
                      <span className="text-muted">
                        <i className="bx bx-purchase-tag-alt align-middle text-muted me-1"></i>
                        {item.category?.name || "General"}
                      </span>
                    </li>
                    <li className="list-inline-item me-3">
                      <span className="text-muted">
                        <i className="bx bx-user align-middle text-muted me-1"></i>
                        {item.user?.name || "Admin"}
                      </span>
                    </li>
                    <li className="list-inline-item me-3  ">
                      <Link to={`/edit-job/${item.id}`}>
                        <i
                          className="bx bx-edit align-middle fw-20 text-primary me-2"
                          title="Edit"
                          style={{ cursor: "pointer" }}
                        ></i>
                      </Link>
                    </li>
                  </ul>
                  <p>{stripHtml(item.shortdescription).substring(0, 100)}...</p>
                  <Row>
                    <Col sm={9} md={9} lg={9}>
                      <div>
                        <Link to={`/job-details/${item.id}`} className="text-primary">
                          Read more <i className="mdi mdi-arrow-right"></i>
                        </Link>
                      </div>
                    </Col>
                    <Col sm={3} md={3} lg={3}>
                      <i className="bx bx-trash align-middle text-danger me-2"
                        title="Delete"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleDelete(item.id)}
                      >
                        Delete
                      </i>
                    </Col>
                  </Row>

                </div>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Pagination */}
        <div className="text-center mt-4">
          <ul className="pagination justify-content-center">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>
                &laquo;
              </button>
            </li>
            {Array.from({ length: totalPages }, (_, index) => (
              <li
                key={index + 1}
                className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}
              >
                <button className="page-link" onClick={() => setCurrentPage(index + 1)}>
                  {index + 1}
                </button>
              </li>
            ))}
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>
                &raquo;
              </button>
            </li>
          </ul>
        </div>

        {/* Add Job Modal */}
        <Modal isOpen={modal} toggle={toggleModal} size="lg">
          <ModalHeader toggle={toggleModal}>Add News</ModalHeader>
          <ModalBody>
            <form onSubmit={handleSubmit}>
              <Container fluid>
                <Row>
                  <Col>
                    {alertMsg.message && (
                      <Alert color={alertMsg.type}>{alertMsg.message}</Alert>
                    )}
                    <Col lg={12} className="mt-3">
                      <label className="form-label">Title</label>
                      <input
                        className="form-control"
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                      />
                      {errors.title && <span className="text-danger">{errors.title}</span>}
                    </Col>

                    <Col lg={12} className="mt-3">
                      <label className="form-label">Short Description</label>
                      <textarea
                        className="form-control"
                        name="shortdescription"
                        value={formData.shortdescription}
                        onChange={handleChange}
                        rows={4}
                      />
                      {errors.shortdescription && (
                        <span className="text-danger">{errors.shortdescription}</span>
                      )}
                    </Col>

                    <Col lg={12} className="mt-3">
                      <label className="form-label">Description</label>

                      <CKEditor
                        editor={ClassicEditor}
                        data={formData.description}
                        onChange={(event, editor) => {
                          const content = editor.getData();
                          setFormData({ ...formData, description: content });
                        }}
                      />

                      {errors.description && (
                        <span className="text-danger">{errors.description}</span>
                      )}
                    </Col>

                    <Col lg={12} className="mt-3">
                      <label className="form-label">Category</label>
                      <select
                        className="form-control"
                        name="category_id"
                        value={formData.category_id}
                        onChange={handleChange}
                      >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                      {errors.category_id && <span className="text-danger">{errors.category_id}</span>}
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

                    <Col lg={12} className="mt-3">
                      <label className="form-label">Featured Image</label>
                      <input
                        className="form-control"
                        type="file"
                        name="featured_image"
                        onChange={handleChange}
                      />
                      {errors.featured_image && <span className="text-danger">{errors.featured_image}</span>}
                    </Col>

                    <Col lg={12} className="mt-3">
                      <label className="form-label">Link</label>
                      <input
                        className="form-control"
                        type="text"
                        name="link"
                        value={formData.link}
                        onChange={handleChange}
                      />
                      {errors.title && <span className="text-danger">{errors.link}</span>}
                    </Col>

                    <Col lg={12} className="mt-3">
                      <label className="form-label">Apply Link</label>
                      <input
                        className="form-control"
                        type="text"
                        name="apply_link"
                        value={formData.apply_link}
                        onChange={handleChange}
                      />
                      {errors.title && <span className="text-danger">{errors.apply_link}</span>}
                    </Col>
                    <Col lg={12} className="mt-4 text-center">
                      <Button type="submit" color="primary">Submit</Button>
                    </Col>
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

export default JobList;
