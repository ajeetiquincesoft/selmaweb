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

const ParkCreationCategory = () => {
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

    const [formData, setFormData] = useState({
        name: "",
        status: "",
        image: null,
    });

    const [errors, setErrors] = useState({});

    const toggleModal = (category = null) => {
        if (category) {
            setFormData({
                name: category.name || "",
                status: category.status || "",
                image: null, // Only allow changing image, not pre-filling file
            });
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
            const response = await axios.get(`${BASE_URL}/auth/getAllParksAndRecreationCategories`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setCategories(response.data.data || []);
        } catch (err) {
            console.error("Failed to fetch park categories", err);
            setAlertMsg({ type: "danger", message: "Failed to load categories" });
        } finally {
            setLoading(prev => ({ ...prev, categories: false, initial: false }));
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFormData(prev => ({ ...prev, image: file }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = "Name is required";
        if (formData.status === "") newErrors.status = "Status is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const resetForm = () => {
        setFormData({ name: "", status: "", image: null });
        setErrors({});
        setEditId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(prev => ({ ...prev, submit: true }));
        const payload = new FormData();
        payload.append("name", formData.name);
        payload.append("status", formData.status);
        if (formData.image) {
            payload.append("image", formData.image);
        }

        if (editId) {
            payload.append("id", editId);
        }

        try {
            const endpoint = editId
                ? `${BASE_URL}/auth/updateParksAndRecreationCategory`
                : `${BASE_URL}/auth/addParksAndRecreationCategory`;

            await axios.post(endpoint, payload, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            });

            setAlertMsg({
                type: "success",
                message: editId
                    ? "Category updated successfully!"
                    : "Category added successfully!",
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
        if (!window.confirm("Are you sure to delete this category?")) return;

        try {
            setLoading(prev => ({ ...prev, delete: id }));
            await axios.post(`${BASE_URL}/auth/deleteParksAndRecreationCategory`,
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

    document.title = "Parks & Recreation Category | City of Selma";

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
                            <li className="active">Parks & Recreation Category</li>
                        </ul>
                        <Button color="primary" onClick={() => toggleModal()}>
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
                                <p>Loading park categories...</p>
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
                                                <td className="d-flex align-items-center gap-2">
                                                    {cat.image && (
                                                        <img
                                                            src={`https://selmaapi.webstage247.com/uploads/${cat.image}`}
                                                            alt={cat.name}
                                                            style={{
                                                                width: "40px",
                                                                height: "40px",
                                                                borderRadius: "50%",
                                                                objectFit: "cover",
                                                            }}
                                                        />
                                                    )}
                                                    <span>{cat.name}</span>
                                                </td>
                                                <td>{cat.status == 1 ? "Active" : "Deactivate"}</td>
                                                <td>
                                                    <Button
                                                        color="warning"
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

                {/* Modal Form */}
                <Modal isOpen={modalOpen} toggle={toggleModal}>
                    <ModalHeader toggle={toggleModal}>
                        {editId ? "Edit" : "Add"} Park Category
                    </ModalHeader>
                    <ModalBody>
                        <form onSubmit={handleSubmit} encType="multipart/form-data">
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
                                <label className="form-label">Image</label>
                                <input
                                    className="form-control"
                                    type="file"
                                    name="image"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
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
                                    <option value="0">Deactivate</option>
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

export default ParkCreationCategory;