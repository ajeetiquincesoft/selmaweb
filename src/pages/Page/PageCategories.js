import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
  Table,
  Spinner
} from "reactstrap";
import BASE_URL from "path"; // Replace with actual BASE_URL
import Breadcrumbs from "../../components/Common/Breadcrumb";

const PageCategories = () => {
  const [token, setToken] = useState(null);
  const [alertMsg, setAlertMsg] = useState({ type: "", message: "" });
  const [modalOpen, setModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [loading, setLoading] = useState({
    initial: true,
    categories: false,
    submit: false,
    delete: false
  });

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
      setLoading(prev => ({ ...prev, categories: true }));
      const response = await axios.get(`${BASE_URL}/auth/getallpagescategory`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCategories(response.data.data || []);
    } catch (err) {
      console.error("Failed to fetch page categories", err);
    } finally {
      setLoading(prev => ({ ...prev, categories: false, initial: false }));
    }
  };

  const [formData, setFormData] = useState({
    name: "",
    status: "",
  });

  const [errors, setErrors] = useState({});

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
      setLoading(prev => ({ ...prev, submit: true }));
      if (editMode && currentId) {
        await axios.post(
          `${BASE_URL}/auth/updatePagesCategory`,
          { ...formData, id: currentId },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setAlertMsg({ type: "success", message: "Page Category updated successfully!" });
      } else {
        await axios.post(
          `${BASE_URL}/auth/addpagescategory`,
          formData,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setAlertMsg({ type: "success", message: "Page Category added successfully!" });
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
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure to delete this category?")) return;
    try {
      setLoading(prev => ({ ...prev, delete: id }));
      await axios.post(
        `${BASE_URL}/auth/deletepagecategory`,
        { id: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAlertMsg({ type: "success", message: "Category deleted successfully!" });
      fetchCategories();
    } catch (err) {
      setAlertMsg({ type: "danger", message: "Failed to delete category!" });
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };

  const handleEdit = (cat) => {
    setFormData({ name: cat.name, status: cat.status });
    setEditMode(true);
    setCurrentId(cat.id);
    setModalOpen(true);
  };

  document.title = "Page Category | City of Selma";

  if (loading.initial) {
    return (
      <div className="page-content">
        <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
          <Spinner color="primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <Container fluid>
        <Row className="mb-3">
          <Col className="d-flex justify-content-between align-items-center">
            <ul className="breadcrumb">
              <li>
                <Link to="/"><a href="/">Home /</a></Link>
              </li>
              <li className="active">Page Category</li>
            </ul>
            <Button color="primary" onClick={() => { resetForm(); toggleModal(); }}>
              Add Category
            </Button>
          </Col>
        </Row>

        {alertMsg.message && (
          <Alert color={alertMsg.type}>{alertMsg.message}</Alert>
        )}

        <Row>
          <Col>
            {loading.categories ? (
              <div className="text-center my-5">
                <Spinner color="primary" />
                <p>Loading categories...</p>
              </div>
            ) : (
              <Table responsive className="align-middle table-nowrap mb-0 table table-hover">
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
                          {loading.delete === cat.id ? (
                            <Spinner size="sm" color="danger" />
                          ) : (
                            <Button
                              color="danger"
                              size="sm"
                              onClick={() => handleDelete(cat.id)}
                            >
                              Delete
                            </Button>
                          )}
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
            )}
          </Col>
        </Row>

        <Modal isOpen={modalOpen} toggle={toggleModal}>
          <ModalHeader toggle={toggleModal}>
            {editMode ? "Edit Page Category" : "Add Page Category"}
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
                <Button color="primary" type="submit" disabled={loading.submit}>
                  {loading.submit ? (
                    <>
                      <Spinner size="sm" className="me-2" /> {editMode ? "Updating..." : "Submitting..."}
                    </>
                  ) : editMode ? "Update" : "Submit"}
                </Button>
              </div>
            </form>
          </ModalBody>
        </Modal>
      </Container>
    </div>
  );
};

export default PageCategories;
