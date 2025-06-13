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
    Alert,
} from "reactstrap";
import axios from "axios";
import classnames from "classnames";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import BASE_URL from "path"; // Replace with your actual BASE_URL import
import "../../custom.css";

const RecyclingAndGarbageList = () => {
    const [activeTab, toggleTab] = useState("1");
    const [modal, setModal] = useState(false);
    const [token, setToken] = useState(null);
    const [getnews, setNews] = useState([]);
    const [errors, setErrors] = useState({});
    const [alertMsg, setAlertMsg] = useState({ type: "", message: "" });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        shortdescription: "",
        image: null,
        status: ""
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
            fetchRecyclingData(currentPage);
        }
    }, [token, currentPage]);

    const fetchRecyclingData = async (page = 1) => {
        try {
            const response = await axios.get(`${BASE_URL}/auth/getAllRecyclingAndGarbage?status=all`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    limit: 15,
                    page: page
                },
            });
            setNews(response.data.data || []);
            setCurrentPage(response.data.pagination.currentPage);
            setTotalPages(response.data.pagination.totalPages);
        } catch (err) {
            console.error("Failed to fetch Recycling & Garbage data", err);
        }
    };

    const stripHtml = (html) => {
        const div = document.createElement("div");
        div.innerHTML = html;
        return div.textContent || div.innerText || "";
    };

    const toggleModal = () => {
        setFormData({
            title: "",
            description: "",
            shortdescription: "",
            image: null,
            status: ""
        });
        setModal(!modal);
    }

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "file" ? files[0] : value,
        }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.title) newErrors.title = "Title is required";
        if (!formData.description) newErrors.description = "Description is required";
        if (!formData.shortdescription) newErrors.shortdescription = "Short description is required";
        if (!formData.image) newErrors.image = "Image is required";
        if (!formData.status) newErrors.status = "Status is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        const data = new FormData();
        data.append("title", formData.title);
        data.append("description", formData.description);
        data.append("shortdescription", formData.shortdescription);
        data.append("image", formData.image);
        data.append("status", formData.status);
        try {
            const response = await axios.post(`${BASE_URL}/auth/addRecyclingAndGarbage`, data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            });
            setAlertMsg({ type: "success", message: "News added successfully!" });
            fetchRecyclingData(currentPage);
            setTimeout(() => {

                setModal(false);
                setAlertMsg({ type: "", message: "" });
            }, 2000);
        } catch (error) {
            console.error("API error:", error);
            setAlertMsg({ type: "danger", message: "Something Went Wrong!" });
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this item?")) {
            try {
                const response = await axios.post(`${BASE_URL}/auth/deleteRecyclingAndGarbage`, { id }, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });
                fetchRecyclingData(currentPage);
            } catch (error) {
                console.error("Error deleting item:", error);
            }
        }
    };

    return (
        <div className="page-content">
            <Col xl={12} lg={12}>
                <Row className="justify-content-between mb-3">
                    <Col xs="auto">
                        <ul className="breadcrumb">
                            <li>
                                <Link to="/"><a href="/">Home /</a></Link>
                            </li>
                            <li className="active">Recycling & Garbage list</li>
                        </ul>
                    </Col>
                    <Col xs="auto">
                        <Button color="primary" onClick={toggleModal}>
                            <i className="mdi mdi-plus me-1"></i> Add Recycling And Garbage
                        </Button>
                    </Col>
                </Row>

                <Row>
                    {getnews.map((item, index) => (
                        <Col key={index} sm={4}>
                            <Card className="p-1 border shadow-none">
                                <div className="p-3">
                                    <div className="d-flex justify-content-between">
                                        <div>
                                            <h5>
                                                <Link to={`/recycling-garbage-details/${item.id}`} className="text-dark">
                                                    {item.title}
                                                </Link>
                                            </h5>
                                        </div>
                                        <div>
                                            <Link to={`/edit-recycling-garbage/${item.id}`}>
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
                                        src={item.image || "default.jpg"}
                                        alt={item.title}
                                        className="img-thumbnail fixed-size-img"
                                    />
                                </div>

                                <div className="p-3">
                                    <ul className="list-inline d-flex justify-content">
                                        <li className="list-inline-item me-3">
                                            <span className="text-muted">
                                                <i className="bx bx-purchase-tag-alt me-1"></i>
                                                {item.category?.name || "General"}
                                            </span>
                                        </li>
                                        <li className="list-inline-item me-3">
                                            <span className="text-muted">
                                                <i className="bx bx-user me-1"></i>
                                                {item.author?.name || "Admin"}
                                            </span>
                                        </li>
                                    </ul>
                                    <p>{stripHtml(item.shortdescription).substring(0, 100)}...</p>
                                    <Row>
                                        <Col sm={9}>
                                            <Link to={`/recycling-garbage-details/${item.id}`} className="text-primary">
                                                Read more <i className="mdi mdi-arrow-right"></i>
                                            </Link>
                                        </Col>
                                        <Col sm={3}>
                                            <i className="bx bx-trash text-danger" title="Delete" style={{ cursor: 'pointer' }} onClick={() => handleDelete(item.id)}>
                                                Delete
                                            </i>
                                        </Col>
                                    </Row>
                                </div>
                            </Card>
                        </Col>
                    ))}
                </Row>

                <div className="text-center mt-4">
                    <ul className="pagination justify-content-center">
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>&laquo;</button>
                        </li>
                        {Array.from({ length: totalPages }, (_, index) => (
                            <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                                <button className="page-link" onClick={() => setCurrentPage(index + 1)}>{index + 1}</button>
                            </li>
                        ))}
                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>&raquo;</button>
                        </li>
                    </ul>
                </div>
            </Col>

            {/* Modal */}
            <Modal isOpen={modal} toggle={toggleModal} size="lg">
                <ModalHeader toggle={toggleModal}>Add Recycling & Garbage</ModalHeader>
                <ModalBody>
                    <form onSubmit={handleSubmit}>
                        <Container fluid>
                            <Row>
                                <Col>
                                    {alertMsg.message && <Alert color={alertMsg.type}>{alertMsg.message}</Alert>}
                                    <Col lg={12} className="mt-3">
                                        <label className="form-label">Title</label>
                                        <input className="form-control" type="text" name="title" value={formData.title} onChange={handleChange} />
                                        {errors.title && <span className="text-danger">{errors.title}</span>}
                                    </Col>
                                    <Col lg={12} className="mt-3">
                                        <label className="form-label">Short Description</label>
                                        <textarea className="form-control" name="shortdescription" value={formData.shortdescription} onChange={handleChange} rows={4} />
                                        {errors.shortdescription && <span className="text-danger">{errors.shortdescription}</span>}
                                    </Col>
                                    <Col lg={12} className="mt-3">
                                        <label className="form-label">Description</label>
                                        <CKEditor editor={ClassicEditor} data={formData.description} onChange={(event, editor) => setFormData({ ...formData, description: editor.getData() })} />
                                        {errors.description && <span className="text-danger">{errors.description}</span>}
                                    </Col>
                                    <Col lg={12} className="mt-3">
                                        <label className="form-label">Image</label>
                                        <input className="form-control" type="file" name="image" onChange={handleChange} />
                                        {errors.image && <span className="text-danger">{errors.image}</span>}
                                    </Col>
                                    <Col lg={12} className="mt-3">
                                        <label className="form-label">Status</label>
                                        <select className="form-control" name="status" value={formData.status} onChange={handleChange}>
                                            <option value="">Select Status</option>
                                            <option value="0">Unpublished</option>
                                            <option value="2">Draft</option>
                                            <option value="1">Published</option>
                                        </select>
                                        {errors.status && <span className="text-danger">{errors.status}</span>}
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
        </div>
    );
};

export default RecyclingAndGarbageList;
