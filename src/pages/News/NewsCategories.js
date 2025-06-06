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
import BASE_URL from "path"; // Replace "path" with actual BASE_URL import
import Breadcrumbs from "../../components/Common/Breadcrumb";

const NewsCategories = () => {
    const [token, setToken] = useState(null);
    const [alertMsg, setAlertMsg] = useState({ type: "", message: "" });
    const [modalOpen, setModalOpen] = useState(false);
    const [categories, setCategories] = useState([]);

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
            const response = await axios.get(`${BASE_URL}/auth/getallnewscategory`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log(response);
            setCategories(response.data.data || []);
        } catch (err) {
            console.error("Failed to fetch categories", err);
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
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            const response = await axios.post(
                `${BASE_URL}/auth/addnewscategory`,
                formData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setAlertMsg({ type: "success", message: "News Category added successfully!" });
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
        if (!window.confirm("Are you sure to delete this category?")) return;
        try {
            await axios.post(`${BASE_URL}/auth/deletenewscategory`,
                { id: id },
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
            <Breadcrumbs title="News" breadcrumbItem="News Category" />
            <Container fluid>
                <Row className="mb-3">
                    <Col className="d-flex justify-content-between align-items-center">
                        <h4></h4>
                        <Button color="primary" onClick={toggleModal}>
                            Add Category
                        </Button>
                    </Col>
                </Row>

                {alertMsg.message && (
                    <Alert color={alertMsg.type}>{alertMsg.message}</Alert>
                )}

                {/* Table Section */}
                <Row>
                    <Col>
                        <Table bordered responsive mt-2>
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
                    <ModalHeader toggle={toggleModal}>Add News Category</ModalHeader>
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
                                    Submit
                                </Button>
                            </div>
                        </form>
                    </ModalBody>
                </Modal>
            </Container>
        </div>
    );
};

export default NewsCategories;
