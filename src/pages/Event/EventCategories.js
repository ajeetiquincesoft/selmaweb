import React, { useState, useEffect } from "react";
import axios from "axios";
import {
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
import { Link } from "react-router-dom";

const EventCategories = () => {
    const [token, setToken] = useState(null);
    const [alertMsg, setAlertMsg] = useState({ type: "", message: "" });
    const [modalOpen, setModalOpen] = useState(false);
    const [categories, setCategories] = useState([]);
    const [editId, setEditId] = useState(null);
    const [loading, setLoading] = useState({
        initial: true,
        categories: false,
        submit: false,
        delete: false
    });

    const [formData, setFormData] = useState({ name: "", status: "" });
    const [errors, setErrors] = useState({});

    const toggleModal = (category = null) => {
        if (category) {
            setFormData({ name: category.name, status: category.status });
            setEditId(category.id);
        } else {
            resetForm();
        }
        setModalOpen(prev => !prev);
    };

    useEffect(() => {
        const storedUser = localStorage.getItem("authUser");
        if (storedUser) {
            const { token } = JSON.parse(storedUser);
            setToken(token);
        }
    }, []);

    useEffect(() => {
        if (token) fetchCategories();
    }, [token]);

    const fetchCategories = async () => {
        try {
            setLoading(prev => ({ ...prev, categories: true, initial: true }));
            const response = await axios.get(`${BASE_URL}/auth/getalleventcategory`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCategories(response.data.data || []);
        } catch (err) {
            console.error("Error fetching categories", err);
            setAlertMsg({ type: "danger", message: "Failed to load event categories." });
        } finally {
            setLoading(prev => ({ ...prev, categories: false, initial: false }));
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = "Name is required";
        if (formData.status === "") newErrors.status = "Status is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const resetForm = () => {
        setFormData({ name: "", status: "" });
        setErrors({});
        setEditId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(prev => ({ ...prev, submit: true }));
        const endpoint = editId
            ? `${BASE_URL}/auth/updateeventcategory`
            : `${BASE_URL}/auth/addeventcategory`;

        const payload = editId
            ? { ...formData, id: editId }
            : formData;

        try {
            await axios.post(endpoint, payload, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                }
            });
            setAlertMsg({
                type: "success",
                message: editId
                    ? "Event category updated successfully!"
                    : "Event category added successfully!"
            });
            toggleModal();
            fetchCategories();
        } catch (error) {
            const errMsg = error.response?.data?.message || "Something went wrong!";
            setAlertMsg({ type: "danger", message: `Error: ${errMsg}` });
        } finally {
            setLoading(prev => ({ ...prev, submit: false }));
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure to delete this event category?")) return;

        try {
            setLoading(prev => ({ ...prev, delete: id }));
            await axios.post(`${BASE_URL}/auth/deleteeventcategory`, { id }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAlertMsg({ type: "success", message: "Category deleted successfully!" });
            fetchCategories();
        } catch (err) {
            setAlertMsg({ type: "danger", message: "Failed to delete category!" });
        } finally {
            setLoading(prev => ({ ...prev, delete: false }));
        }
    };

    document.title = "Event Category | City of Selma";

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
                            <li className="active">Event Category</li>
                        </ul>
                        <Button color="primary" onClick={() => toggleModal()}>
                            Add Event Category
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
                                <p>Loading event categories...</p>
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
                                                <td>
                                                    <Link to={`/event-list?category_id=${cat.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                                        {cat.name}
                                                    </Link>
                                                </td>
                                                <td>{cat.status == 1 ? "Active" : "Inactive"}</td>
                                                <td>
                                                    <Button
                                                        color="info"
                                                        size="sm"
                                                        className="me-2"
                                                        onClick={() => toggleModal(cat)}
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

                <Modal isOpen={modalOpen} toggle={() => toggleModal()}>
                    <ModalHeader toggle={() => toggleModal()}>
                        {editId ? "Edit" : "Add"} Event Category
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
                                    <option value="0">Inactive</option>
                                </select>
                                {errors.status && (
                                    <small className="text-danger">{errors.status}</small>
                                )}
                            </div>
                            <div className="text-end">
                                <Button color="primary" type="submit" disabled={loading.submit}>
                                    {loading.submit ? (
                                        <>
                                            <Spinner size="sm" className="me-2" />
                                            {editId ? "Updating..." : "Submitting..."}
                                        </>
                                    ) : editId ? "Update" : "Submit"}
                                </Button>
                            </div>
                        </form>
                    </ModalBody>
                </Modal>
            </Container>
        </div>
    );
};

export default EventCategories;