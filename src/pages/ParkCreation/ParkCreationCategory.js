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
    Table
} from "reactstrap";
import BASE_URL from "path"; // Replace with actual BASE_URL
import Breadcrumbs from "../../components/Common/Breadcrumb";

const ParkCreationCategory = () => {
    const [token, setToken] = useState(null);
    const [alertMsg, setAlertMsg] = useState({ type: "", message: "" });
    const [modalOpen, setModalOpen] = useState(false);
    const [categories, setCategories] = useState([]);
    const [editId, setEditId] = useState(null);

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
            const response = await axios.get(`${BASE_URL}/auth/getAllParksAndRecreationCategories`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setCategories(response.data.data || []);
        } catch (err) {
            console.error("Failed to fetch park categories", err);
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
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure to delete this category?")) return;

        try {
            await axios.post(`${BASE_URL}/auth/deleteParksAndRecreationCategory`,
                { id },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setAlertMsg({ type: "success", message: "Category deleted successfully!" });
            fetchCategories();
        } catch (err) {
            setAlertMsg({ type: "danger", message: "Failed to delete category!" });
        }
    };

    return (
        <div className="page-content">
            <Breadcrumbs title="Park and Recreation" breadcrumbItem="Parks & Recreation Category" />
            <Container fluid>
                <Row className="mb-3">
                    <Col className="d-flex justify-content-between align-items-center">
                        <h4></h4>
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
                        <Table bordered responsive>
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
                                                        src={`http://192.168.10.140:3000/uploads/${cat.image}`}
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
                                            <td>{cat.status === "1" ? "Active" : "Pending"}</td>
                                            <td>
                                                <Button
                                                    color="info"
                                                    size="sm"
                                                    className="me-2"
                                                    onClick={() => toggleModal(cat)}
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
                                    <option value="0">Pending</option>
                                </select>
                                {errors.status && (
                                    <small className="text-danger">{errors.status}</small>
                                )}
                            </div>
                            <div className="text-end">
                                <Button color="primary" type="submit">
                                    {editId ? "Update" : "Submit"}
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
