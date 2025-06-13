import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Card, Col, Row, Button, Modal, ModalHeader, ModalBody, Container, Alert
} from "reactstrap";
import classnames from "classnames";
import axios from "axios";
import BASE_URL from "path"; // Update to your actual BASE_URL
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

import "../../custom.css";

const ParkCreationList = () => {
  const [modal, setModal] = useState(false);
  const [token, setToken] = useState(null);
  const [categories, setCategories] = useState([]);
  const [parks, setParks] = useState([]);
  const [errors, setErrors] = useState({});
  const [alertMsg, setAlertMsg] = useState({ type: "", message: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [facilities, setFacilities] = useState([
    { name: "", address: "", amenities: [] }
  ]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    shortdescription: "",
    featured_image: null,
    images: [],
    category_id: "",
    status: "",
    link: "",
    date: "",
    time: "",
    organizer: "",
    published_at: ""
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("authUser");
    if (storedUser) {
      const { token } = JSON.parse(storedUser);
      setToken(token);
    }
    fetchCategories();
    fetchParkData(currentPage);
  }, [token, currentPage]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/auth/getAllParksAndRecreationCategories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(response.data.data || []);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  };

  const fetchParkData = async (page = 1) => {
    try {
      const response = await axios.get(`${BASE_URL}/auth/getAllParksAndRecreation`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 6, page }
      });
      setParks(response.data.data || []);
      setCurrentPage(response.data.pagination.currentPage);
      setTotalPages(response.data.pagination.totalPages);
    } catch (err) {
      console.error("Failed to fetch parks", err);
    }
  };

  const toggleModal = () => {
    setFormData({
      title: "",
      description: "",
      shortdescription: "",
      featured_image: null,
      address:"",
      images: [],
      category_id: "",
      status: "",
      link: "",
      date: "",
      time: "",
      organizer: "",
      published_at: ""
    });
    setModal(!modal);
  }

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

  // Handle facilities changes
  const handleFacilityChange = (index, e) => {
    const { name, value } = e.target;
    const updatedFacilities = [...facilities];
    updatedFacilities[index][name] = value;
    setFacilities(updatedFacilities);
  };

  // Handle amenities changes
  const handleAmenityChange = (facilityIndex, amenityIndex, value) => {
    const updatedFacilities = [...facilities];
    updatedFacilities[facilityIndex].amenities[amenityIndex] = value;
    setFacilities(updatedFacilities);
  };

  // Add new facility
  const addFacility = () => {
    setFacilities([...facilities, { name: "", address: "", amenities: [""] }]);
  };

  // Remove facility
  const removeFacility = (index) => {
    const updatedFacilities = [...facilities];
    updatedFacilities.splice(index, 1);
    setFacilities(updatedFacilities);
  };

  // Add new amenity to a facility
  const addAmenity = (facilityIndex) => {
    const updatedFacilities = [...facilities];
    updatedFacilities[facilityIndex].amenities.push("");
    setFacilities(updatedFacilities);
  };

  // Remove amenity from a facility
  const removeAmenity = (facilityIndex, amenityIndex) => {
    const updatedFacilities = [...facilities];
    updatedFacilities[facilityIndex].amenities.splice(amenityIndex, 1);
    setFacilities(updatedFacilities);
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title) newErrors.title = "Title is required";
    if (!formData.shortdescription)
      newErrors.shortdescription = "Short description is required";
    if (!formData.description) newErrors.description = "Description is required";
    if (facilities.length === 0 || facilities.some(f => !f.name || !f.address || f.amenities.length === 0))
      newErrors.facilities = "At least one facility with name, address, and amenities is required";
    if (!formData.link) newErrors.link = "Link is required";
    if (!formData.date) newErrors.date = "Date is required";
    if (!formData.time) newErrors.time = "Time is required";
    if (!formData.organizer) newErrors.organizer = "Organizer is required";
    if (!formData.published_at) newErrors.published_at = "Publish date/time required";
    if (!formData.featured_image) newErrors.featured_image = "Featured image is required";
    if (!formData.images.length) newErrors.images = "At least one image is required";
    if (!formData.category_id) newErrors.category_id = "Category is required";
    if (!formData.status) newErrors.status = "Status is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "images") {
        for (let i = 0; i < value.length; i++) {
          data.append("images", value[i]);
        }
      } else if (key === "featured_image") {
        data.append("featured_image", value);
      } else {
        data.append(key, value);
      }
    });

    // Add facilities as JSON string
    data.append("facilities", JSON.stringify(facilities));

    try {
      const response = await axios.post(`${BASE_URL}/auth/addParksAndRecreation`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setAlertMsg({ type: "success", message: "Park added successfully!" });
      setTimeout(() => {
        setFacilities([{ name: "", address: "", amenities: [""] }]);
        setModal(false);
        setAlertMsg({ type: "", message: "" });
        fetchParkData(currentPage);
      }, 2000);
    } catch (error) {
      console.error("API error:", error);
      setAlertMsg({ type: "danger", message: "Something Went Wrong!" });
    }
  };

  const stripHtml = (html) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  };
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this park?")) {
      try {
        const response = await axios.post(`${BASE_URL}/auth/deleteParksAndRecreationById`, { id }, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        fetchParkData();
      } catch (error) {
        console.error("Error deleting park:", error);
      }
    }
  };

  return (
    <div className="page-content">
      <Col xl={12}>
        <Row className="justify-content-between mb-3">
          <Col xs="auto">
            <ul className="breadcrumb">
              <li>
                <Link to="/"><a href="/">Home /</a></Link>
              </li>
              <li className="active">Parks & Recreation List</li>
            </ul>
          </Col>
          <Col xs="auto">
            <Button color="primary" onClick={toggleModal}>
              <i className="mdi mdi-plus me-1"></i> Add Park
            </Button>
          </Col>
        </Row>

        <Row>
          {parks.map((item, index) => (
            <Col key={index} sm={4}>
              <Card className="p-1 border shadow-none">
                <div className="p-3">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h5>
                        <Link to={`/park-details/${item.id}`} className="text-dark">{item.title}</Link>
                      </h5>
                    </div>
                    <div>
                      <Link to={`/edit-park/${item.id}`}>
                        <i
                          className="bx bx-edit align-middle fw-20 text-primary me-2"
                          title="Edit"
                          style={{ cursor: "pointer" }}
                        ></i>
                      </Link>
                    </div>
                  </div>

                  <p className="text-muted mb-0">
                    {new Date(item.createdAt).toLocaleDateString("en-GB")}
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
                  <p>{stripHtml(item.shortdescription).substring(0, 100)}...</p>
                  <Row>
                    <Col sm={9}>
                      <Link to={`/park-details/${item.id}`} className="text-primary">
                        Read more <i className="mdi mdi-arrow-right"></i>
                      </Link>
                    </Col>
                    <Col sm={3}>
                      <i
                        className="bx bx-trash text-danger"
                        title="Delete"
                        style={{ cursor: "pointer" }}
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
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>&laquo;</button>
            </li>
            {Array.from({ length: totalPages }, (_, index) => (
              <li
                key={index}
                className={`page-item ${currentPage === index + 1 ? "active" : ""}`}
              >
                <button className="page-link" onClick={() => setCurrentPage(index + 1)}>
                  {index + 1}
                </button>
              </li>
            ))}
            <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>&raquo;</button>
            </li>
          </ul>
        </div>
      </Col>


      <Modal isOpen={modal} toggle={toggleModal} size="lg">
        <ModalHeader toggle={toggleModal}>Add Park</ModalHeader>
        <ModalBody>
          <form onSubmit={handleSubmit}>
            <Container fluid>
              <Row>
                <Col lg={12}>
                  {alertMsg.message && <Alert color={alertMsg.type}>{alertMsg.message}</Alert>}

                  {[
                    { label: "Title", type: "text", name: "title" },
                    { label: "Short Description", type: "textarea", name: "shortdescription", rows: 3 },
                    { label: "Link", type: "text", name: "link" },
                    { label: "Date", type: "date", name: "date" },
                    { label: "Time", type: "time", name: "time" },
                    { label: "Organizer", type: "text", name: "organizer" },
                    { label: "Published At", type: "datetime-local", name: "published_at" },
                  ].map((field, idx) => (
                    <div className="mt-3" key={idx}>
                      <label className="form-label">{field.label}</label>
                      {field.type === "textarea" ? (
                        <textarea
                          className="form-control"
                          name={field.name}
                          rows={field.rows}
                          value={formData[field.name]}
                          onChange={handleChange}
                        />
                      ) : (
                        <input
                          className="form-control"
                          type={field.type}
                          name={field.name}
                          value={formData[field.name]}
                          onChange={handleChange}
                        />
                      )}
                      {errors[field.name] && <span className="text-danger">{errors[field.name]}</span>}
                    </div>
                  ))}

                  {/* Facilities Section */}
                  <div className="mt-3">
                    <label className="form-label">Facilities</label>
                    {facilities.map((facility, facilityIndex) => (
                      <div key={facilityIndex} className="border p-3 mb-3">
                        <div className="mb-3">
                          <label className="form-label">Facility Name</label>
                          <input
                            type="text"
                            className="form-control"
                            name="name"
                            value={facility.name}
                            onChange={(e) => handleFacilityChange(facilityIndex, e)}
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Address</label>
                          <input
                            type="text"
                            className="form-control"
                            name="address"
                            value={facility.address}
                            onChange={(e) => handleFacilityChange(facilityIndex, e)}
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Amenities</label>
                          {facility.amenities.map((amenity, amenityIndex) => (
                            <div key={amenityIndex} className="input-group mb-2">
                              <input
                                type="text"
                                className="form-control"
                                value={amenity}
                                onChange={(e) => handleAmenityChange(facilityIndex, amenityIndex, e.target.value)}
                              />
                              <button
                                type="button"
                                className="btn btn-danger"
                                onClick={() => removeAmenity(facilityIndex, amenityIndex)}
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => addAmenity(facilityIndex)}
                          >
                            Add Amenity
                          </button>
                        </div>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => removeFacility(facilityIndex)}
                        >
                          Remove Facility
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={addFacility}
                    >
                      Add Another Facility
                    </button>
                    {errors.facilities && <div className="text-danger">{errors.facilities}</div>}
                  </div>

                  {/* Description with CKEditor */}
                  <div className="mt-3">
                    <label className="form-label">Description</label>
                    <CKEditor
                      editor={ClassicEditor}
                      data={formData.description}
                      onChange={(event, editor) =>
                        setFormData({ ...formData, description: editor.getData() })
                      }
                    />
                    {errors.description && <span className="text-danger">{errors.description}</span>}
                  </div>

                  {/* Category Dropdown */}
                  <div className="mt-3">
                    <label className="form-label">Category</label>
                    <select
                      className="form-control"
                      name="category_id"
                      value={formData.category_id}
                      onChange={handleChange}
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    {errors.category_id && <span className="text-danger">{errors.category_id}</span>}
                  </div>

                  {/* Status Dropdown */}
                  <div className="mt-3">
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
                  </div>

                  {/* File Inputs */}
                  {[
                    { label: "Featured Image", name: "featured_image", multiple: false },
                    { label: "Images (Multiple)", name: "images", multiple: true },
                  ].map((file, idx) => (
                    <div className="mt-3" key={idx}>
                      <label className="form-label">{file.label}</label>
                      <input
                        className="form-control"
                        type="file"
                        name={file.name}
                        onChange={handleChange}
                        multiple={file.multiple}
                      />
                      {errors[file.name] && <span className="text-danger">{errors[file.name]}</span>}
                    </div>
                  ))}
                  {/* Submit Button */}
                  <div className="text-center mt-4">
                    <Button type="submit" color="primary">
                      Submit
                    </Button>
                  </div>
                </Col>
              </Row>
            </Container>
          </form>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default ParkCreationList;