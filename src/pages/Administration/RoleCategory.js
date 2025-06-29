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
import BASE_URL from "path"; // Replace with your actual BASE_URL
import Breadcrumbs from "../../components/Common/Breadcrumb";

const AdministrationCategories = () => {
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
  }, [token]);

  const fetchCategories = async () => {
    try {
      setLoading(prev => ({ ...prev, categories: true }));
      const response = await axios.get(`${BASE_URL}/auth/getallroles`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCategories(response.data.data || []);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    } finally {
      setLoading(prev => ({ ...prev, categories: false, initial: false }));
    }
  };

  const [formData, setFormData] = useState({
    role: "",

    permissions: {
      news: false,
      jobs: false,
      event: false,
      park: false,
      recycling: false,
      pages: false
    }
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePermissionChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [name]: checked
      }
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.role.trim()) newErrors.role = "Role Name is required";

    const hasPermission = Object.values(formData.permissions).some(value => value === true);
    if (!hasPermission) {
      newErrors.permissions = "Please select at least one permission";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      role: "",
      permissions: {
        news: false,
        jobs: false,
        event: false,
        park: false,
        recycling: false,
        pages: false
      }
    });
    setErrors({});
    setEditMode(false);
    setCurrentId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(prev => ({ ...prev, submit: true }));

      const payload = {
        ...formData,
        permissions: JSON.stringify(formData.permissions),
        id: currentId
      };

      const url = editMode && currentId
        ? `${BASE_URL}/auth/updaterole`
        : `${BASE_URL}/auth/addrole`;

      await axios.post(url, payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      setAlertMsg({
        type: "success",
        message: editMode ? "Administration Category updated successfully!" : "Administration Category added successfully!"
      });

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
        `${BASE_URL}/auth/deleterole`,
        { id },
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
    let permissions = {
      news: false,
      jobs: false,
      event: false,
      park: false,
      recycling: false,
      pages: false
    };
    if (cat.permissions) {
      try {
        permissions = JSON.parse(cat.permissions);
      } catch (err) {
        console.warn("Invalid permissions JSON", err);
      }
    }

    setFormData({
      role: cat.role,
      permissions
    });

    setEditMode(true);
    setCurrentId(cat.id);
    setModalOpen(true);
  };

  document.title = "Administration Category | City of Selma";

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
              <li><Link to="/">Home /</Link></li>
              <li className="active">Administration Role</li>
            </ul>
            <Button color="primary" onClick={() => { resetForm(); toggleModal(); }}>
              Add Roles
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
                    <th>Name</th>
                    <th>Permissions</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.length > 0 ? (
                    categories.map((cat, index) => (
                      <tr key={cat.id}>
                        <td>{index + 1}</td>
                        <td>{cat.role}</td>

                        <td>
                          {(() => {
                            try {
                              const perms = JSON.parse(cat.permissions || "{}");
                              return Object.entries(perms)
                                .filter(([_, v]) => v)
                                .map(([k]) => k.charAt(0).toUpperCase() + k.slice(1))
                                .join(", ");
                            } catch {
                              return "-";
                            }
                          })()}
                        </td>
                        <td>
                          <Button color="warning" size="sm" className="me-2" onClick={() => handleEdit(cat)}>Edit</Button>
                          {/* {loading.delete === cat.id ? (
                            <Spinner size="sm" color="danger" />
                          ) : (
                            <Button color="danger" size="sm" onClick={() => handleDelete(cat.id)}>Delete</Button>
                          )} */}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center">No categories found.</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            )}
          </Col>
        </Row>

        <Modal isOpen={modalOpen} toggle={toggleModal}>
          <ModalHeader toggle={toggleModal}>
            {editMode ? "Edit Administration Category" : "Add Administration Category"}
          </ModalHeader>
          <ModalBody>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label"> Name</label>
                <input
                  className="form-control"
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                />
                {errors.role && <small className="text-danger">{errors.role}</small>}
              </div>



              <div className="mb-3">
                <label className="form-label h5"><u>Permissions</u></label>
                {[
                  { label: "News", name: "news" },
                  { label: "Jobs", name: "jobs" },
                  { label: "Event", name: "event" },
                  { label: "Park & Recreation", name: "park" },
                  { label: "Recycling & Garbage", name: "recycling" },
                  { label: "Pages", name: "pages" },
                  { label: "Notification", name: "notification" }
                ].map((perm) => (
                  <div className="form-check" key={perm.name}>
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={perm.name}
                      name={perm.name}
                      defaultChecked={formData.permissions[perm.name]}
                      onChange={handlePermissionChange}

                    />
                    <label className="form-check-label" htmlFor={perm.name}>
                      {perm.label}
                    </label>
                  </div>
                ))}
                {errors.permissions && (
                  <small className="text-danger d-block mt-1">{errors.permissions}</small>
                )}
              </div>



              <div className="text-end">
                <Button color="primary" type="submit" disabled={loading.submit}>
                  {loading.submit ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      {editMode ? "Updating..." : "Submitting..."}
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

export default AdministrationCategories;
