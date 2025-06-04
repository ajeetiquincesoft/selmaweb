import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  Col,
  Nav,
  NavItem,
  NavLink,
  Row,
  TabContent,
  TabPane,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  Container,
  Alert,
} from "reactstrap";
import classnames from "classnames";
import axios from "axios";
import BASE_URL from "path"; // Replace with your actual BASE_URL import
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import "../../custom.css";


// Import images
import img1 from "../../assets/images/small/img-2.jpg";
import img2 from "../../assets/images/small/img-6.jpg";
import img3 from "../../assets/images/small/img-1.jpg";

const NewsList = () => {
  const [activeTab, toggleTab] = useState("1");
  const [modal, setModal] = useState(false);
  const [token, setToken] = useState(null);
  const [categories, setCategories] = useState([]);
  const [getnews, setNews] = useState([]);
  const [errors, setErrors] = useState({});
  const [alertMsg, setAlertMsg] = useState({ type: "", message: "" });

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    shortdescription: "",
    featured_image: null,
    images: [],
    category_id: "",
    status: ""
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("authUser");
    if (storedUser) {
      const { token } = JSON.parse(storedUser);
      setToken(token);
    }
    fetchCategories();
    fetchNewsdata();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/auth/getallnewscategory`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCategories(response.data.data || []);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  };
  const fetchNewsdata = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/auth/getallnews`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          limit: 100,
        },
      });
      setNews(response.data.data || []);
    } catch (err) {
      console.error("Failed to fetch categories", err);
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
    if (!formData.images || formData.images.length === 0) newErrors.images = "At least one image is required";
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
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("shortdescription", formData.shortdescription);
    data.append("featured_image", formData.featured_image);

    for (let i = 0; i < formData.images.length; i++) {
      data.append("images", formData.images[i]);
    }

    data.append("category_id", formData.category_id);
    data.append("status", formData.status);
    data.append("published_at", today);

    try {
      const response = await axios.post(
        `${BASE_URL}/auth/addnews`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAlertMsg({ type: "success", message: "News added successfully!" });
      // Reset form and close modal after 2 seconds
      setTimeout(() => {
        setFormData({
          title: "",
          description: "",
          shortdescription: "",
          featured_image: null,
          images: [],
          category_id: "",
          status: ""
        });
        setModal(false);
        setAlertMsg({ type: "", message: "" });
      }, 2000);
    } catch (error) {
      console.error("API error:", error);
      setAlertMsg({ type: "danger", message: "Something Went Wrong!" });
    }
  };

  return (
    <>
      <Col xl={12} lg={12}>
        <div>
          <Row className="justify-content-between mb-3">
            <Col xs="auto">
              <h4>News List</h4>
            </Col>
            <Col xs="auto">
              <Button color="primary" onClick={toggleModal}>
                <i className="mdi mdi-plus me-1"></i> Add News
              </Button>
            </Col>
          </Row>

          <Row className="justify-content-center">
            <Col xl={12}>
              <div>
                <Row>
                  {getnews.map((item, index) => (
                    <Col key={index} sm={4} md={4} lg={4}>
                      <Card className="p-1 border shadow-none">
                        <div className="p-3">
                          <h5>
                            <Link to={`/news-details/${item.id}`} className="text-dark">
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
                          <ul className="list-inline">
                            <li className="list-inline-item me-3">
                              <span className="text-muted">
                                <i className="bx bx-purchase-tag-alt align-middle text-muted me-1"></i>
                                {item.category?.name || "General"}
                              </span>
                            </li>
                            <li className="list-inline-item me-3">
                              <span className="text-muted">
                                <i className="bx bx-user align-middle text-muted me-1"></i>
                                {item.author?.name || "Admin"}
                              </span>
                            </li>
                          </ul>
                          <p>{stripHtml(item.shortdescription).substring(0, 100)}...</p>
                          <Row>
                            <Col sm={6} md={6} lg={6}>
                              <div>
                                <Link to={`/news-details/${item.id}`} className="text-primary">
                                  Read more <i className="mdi mdi-arrow-right"></i>
                                </Link>
                              </div>
                            </Col>
                            <Col sm={3} md={3} lg={3}>
                              <i className="bx bx-edit-alt align-middle text-primary me-2" title="Edit"></i>
                            </Col>
                            <Col sm={3} md={3} lg={3}>
                              <i className="bx bx-trash align-middle text-danger me-2" title="Delete"></i>
                            </Col>
                          </Row>

                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
                {/* Pagination */}
                <div className="text-center mt-4">
                  <ul className="pagination justify-content-center pagination-rounded">
                    <li className="page-item disabled">
                      <Link to="#" className="page-link">
                        <i className="mdi mdi-chevron-left"></i>
                      </Link>
                    </li>
                    <li className="page-item">
                      <Link to="#" className="page-link">
                        1
                      </Link>
                    </li>
                    <li className="page-item active">
                      <Link to="#" className="page-link">
                        2
                      </Link>
                    </li>
                    <li className="page-item">
                      <Link to="#" className="page-link">
                        3
                      </Link>
                    </li>
                    <li className="page-item">
                      <Link to="#" className="page-link">
                        ...
                      </Link>
                    </li>
                    <li className="page-item">
                      <Link to="#" className="page-link">
                        10
                      </Link>
                    </li>
                    <li className="page-item">
                      <Link to="#" className="page-link">
                        <i className="mdi mdi-chevron-right"></i>
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </Col>

      {/* Add News Modal */}
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

                    <CKEditor
                      editor={ClassicEditor}
                      data={formData.shortdescription}
                      onChange={(event, editor) => {
                        const content = editor.getData();
                        setFormData({ ...formData, shortdescription: content });
                      }}
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
                    <label className="form-label">Images (multiple)</label>
                    <input
                      className="form-control"
                      type="file"
                      name="images"
                      onChange={handleChange}
                      multiple
                    />
                    {errors.images && <span className="text-danger">{errors.images}</span>}
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
    </>
  );
};

export default NewsList;