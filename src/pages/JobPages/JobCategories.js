import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardBody,
  CardTitle,
  Col,
  Container,
  Row,
  Button,
  Alert,
  Modal,
  ModalHeader,
  ModalBody,
  Table
} from "reactstrap";
import BASE_URL from "path"; // Replace with your actual BASE_URL
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { Link } from "react-router-dom";

const JobCategories = () => {
  const [token, setToken] = useState(null);
  const [alertMsg, setAlertMsg] = useState({ type: "", message: "" });
  const [modalOpen, setModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    status: ""
  });

  const [errors, setErrors] = useState({});

  const toggleModal = () => setModalOpen(!modalOpen);

  useEffect(() => {
    const storedUser = localStorage.getItem("authUser");
    if (storedUser) {
      const { token } = JSON.parse(storedUser);
      setToken(token);
    }

    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/auth/getalljobcategory`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data);
      setCategories(response.data.data || []);
    } catch (err) {
      console.error("Failed to fetch job categories", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.status) newErrors.status = "Status is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({ name: "", status: "" });
    setErrors({});
    setEditMode(false);
    setCurrentId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (editMode && currentId) {
        // Update existing category
        await axios.post(
          `${BASE_URL}/auth/updatejobcategory`,
          { ...formData, id: currentId },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setAlertMsg({ type: "success", message: "Job Category updated successfully!" });
      } else {
        // Add new category
        await axios.post(
          `${BASE_URL}/auth/addjobcategory`,
          formData,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setAlertMsg({ type: "success", message: "Job Category added successfully!" });
      }

      resetForm();
      toggleModal();
      fetchCategories();
    } catch (error) {
      const errMsg =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong!";
      setAlertMsg({ type: "danger", message: "Error: " + errMsg });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure to delete this job category?")) return;
    try {
      await axios.post(`${BASE_URL}/auth/deletejobcategory`,
        { id: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAlertMsg({ type: "success", message: "Category deleted successfully!" });
      fetchCategories();
    } catch (err) {
      setAlertMsg({ type: "danger", message: "Failed to delete category!" });
    }
  };

  const handleEdit = (cat) => {
    setFormData({ name: cat.name, status: cat.status });
    setEditMode(true);
    setCurrentId(cat.id);
    setModalOpen(true);
  };
document.title="Job Category | City of Selma";
  return (
    <div className="page-content">

      <Container fluid>
        <Row className="mb-3">
          <Col className="d-flex justify-content-between align-items-center">
            <ul className="breadcrumb">
              <li>
                <Link to="/"><a href="/">Home /</a></Link>
              </li>
              <li className="active">Job Category</li>
            </ul>
            <Button color="primary" onClick={() => { resetForm(); toggleModal(); }}>
              Add Job Category
            </Button>
          </Col>
        </Row>

        {alertMsg.message && (
          <Alert color={alertMsg.type}>{alertMsg.message}</Alert>
        )}

        <Row>
          <Col>
             <Table  responsive className="align-middle table-nowrap mb-0 table table-hover">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Category Name</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {categories.length > 0 ? (
                  categories.map((cat, index) => (
                    <tr key={cat.id}>
                      <td>{index + 1}</td>
                      <td>{cat.name}</td>
                      <td>{cat.status === "1" ? "Active" : "Pending"}</td>
                      <td>
                        <Button
                          color="warning"
                          size="sm"
                          className="me-2"
                          onClick={() => handleEdit(cat)}
                        >
                          Edit
                        </Button>
                        <Button
                          color="danger"
                          size="sm"
                          onClick={() => handleDelete(cat.id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center">
                      No categories found.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Col>
        </Row>

        <Modal isOpen={modalOpen} toggle={toggleModal}>
          <ModalHeader toggle={toggleModal}>
            {editMode ? "Edit Job Category" : "Add Job Category"}
          </ModalHeader>
          <ModalBody>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Name</label>
                <input
                  className="form-control"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
                {errors.name && (
                  <small className="text-danger">{errors.name}</small>
                )}
              </div>
              <div className="mb-3">
                <label className="form-label">Status</label>
                <select
                  className="form-control"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  <option value="1">Active</option>
                  <option value="0">Pending</option>
                </select>
                {errors.status && (
                  <small className="text-danger">{errors.status}</small>
                )}
              </div>
              <div className="text-end">
                <Button color="primary" type="submit">
                  {editMode ? "Update" : "Submit"}
                </Button>
              </div>
            </form>
          </ModalBody>
        </Modal>
      </Container>
    </div>
  );
};

export default JobCategories;
