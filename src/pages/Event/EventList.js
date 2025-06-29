import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
    Spinner
} from "reactstrap";
import axios from "axios";
import BASE_URL from "path"; // Replace with actual BASE_URL
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import "../../custom.css";

const EventList = () => {
    const [modal, setModal] = useState(false);
    const [token, setToken] = useState(null);
    const [categories, setCategories] = useState([]);
    const [events, setEvents] = useState([]);
    const [errors, setErrors] = useState({});
    const [alertMsg, setAlertMsg] = useState({ type: "", message: "" });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState({
        events: false,
        categories: false,
        submit: false,
        delete: false
    });
    const [searchKeyword, setSearchKeyword] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const navigate = useNavigate();
    const searchParams = new URLSearchParams(window.location.search);
    const categoryIdPera = searchParams.get('category_id');
    const formRef = useRef(null);

    const [formData, setFormData] = useState({
        title: "",
        shortdescription: "",
        description: "",
        featured_image: null,
        files: [],
        link: "",
        category_id: "",
        date: "",
        time: "",
        organizor: "",
        status: "",
        address: ""
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
            fetchCategories();

            const filters = {
                category_id: categoryIdPera || "",
            };
            fetchEventData(1, filters);
            if (categoryIdPera) {
                setSelectedCategory(categoryIdPera);
            }
        }
    }, [token]);

    const fetchCategories = async () => {
        try {
            setLoading(prev => ({ ...prev, categories: true }));
            const response = await axios.get(`${BASE_URL}/auth/getalleventcategory`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCategories(response.data.data || []);
        } catch (err) {
            console.error("Failed to fetch event categories", err);
        } finally {
            setLoading(prev => ({ ...prev, categories: false }));
        }
    };

    const fetchEventData = async (page = 1, filters = {}) => {
        try {
            setLoading(prev => ({ ...prev, events: true }));
            const params = {
                limit: 3,
                page: page,
                ...filters,
                status: filters.status ? filters.status : "all",
            };

            // Only include status if it's not empty
            if (params.status === "") {
                delete params.status;
            }

            const response = await axios.get(`${BASE_URL}/auth/getallevents`, {
                headers: { Authorization: `Bearer ${token}` },
                params: params,
            });
            setEvents(response.data.data || []);
            setCurrentPage(response.data.pagination.currentPage);
            setTotalPages(response.data.pagination.totalPages);
        } catch (err) {
            console.error("Failed to fetch events", err);
        } finally {
            setLoading(prev => ({ ...prev, events: false }));
        }
    };

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        navigate(`/event-list?`);
        const filters = {};

        if (searchKeyword) {
            filters.keyword = searchKeyword;
        }

        if (selectedCategory) {
            filters.category_id = selectedCategory;
        }

        if (selectedStatus) {
            filters.status = selectedStatus;
        }

        // Reset to page 1 when applying new filters
        setCurrentPage(1);
        fetchEventData(1, filters);
    };

    const stripHtml = (html) => {
        const div = document.createElement("div");
        div.innerHTML = html;
        return div.textContent || div.innerText || "";
    };

    const toggleModal = () => {
        setFormData({
            title: "",
            shortdescription: "",
            description: "",
            featured_image: null,
            files: [],
            link: "",
            category_id: "",
            date: "",
            time: "",
            organizor: "",
            status: "",
            address: ""
        });
        setModal(!modal);
    }

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "file"
                ? name === "files"
                    ? files
                    : files[0]
                : value,
        }));
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.title) newErrors.title = "Title is required";
        if (!formData.description) newErrors.description = "Description is required";
        if (!formData.featured_image) newErrors.featured_image = "Featured image is required";
        if (!formData.address) newErrors.address = "address is required";
        if (!formData.category_id) newErrors.category_id = "Category is required";
        if (!formData.date) newErrors.date = "Date is required";
        if (!formData.time) newErrors.time = "Time is required";
        if (!formData.organizor) newErrors.organizor = "Organizor is required";
        if (!formData.status) newErrors.status = "Status is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(prev => ({ ...prev, submit: true }));
        const now = new Date();
        const dateTimeString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
            now.getDate()
        ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(
            now.getMinutes()
        ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

        const data = new FormData();
        data.append("title", formData.title);
        data.append("description", formData.description);
        data.append("shortdescription", formData.shortdescription);
        data.append("featured_image", formData.featured_image);
        for (let i = 0; i < formData.files.length; i++) {
            data.append("files", formData.files[i]);
        }
        data.append("link", formData.link || "");
        data.append("address", formData.address);
        data.append("category_id", formData.category_id);
        data.append("date", formData.date);
        data.append("time", formData.time);
        data.append("organizor", formData.organizor);
        data.append("status", formData.status);
        data.append("published_at", dateTimeString);

        try {
            await axios.post(`${BASE_URL}/auth/addevent`,
                data,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${token}`,
                    },
                });
            setAlertMsg({ type: "success", message: "Event added successfully!" });

            // Refresh event list with current filters
            const filters = {};
            if (searchKeyword) filters.keyword = searchKeyword;
            if (selectedCategory) filters.category_id = selectedCategory;
            if (selectedStatus) filters.status = selectedStatus;
            fetchEventData(currentPage, filters);

            setTimeout(() => {
                setModal(false);
                setAlertMsg({ type: "", message: "" });
            }, 2000);
        } catch (error) {
            console.error("API error:", error);
            setAlertMsg({ type: "danger", message: "Something went wrong!" });
        } finally {
            setLoading(prev => ({ ...prev, submit: false }));
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this event?")) {
            try {
                setLoading(prev => ({ ...prev, delete: id }));
                await axios.post(`${BASE_URL}/auth/deleteevent`, { id }, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                // Refresh event list with current filters
                const filters = {};
                if (searchKeyword) filters.keyword = searchKeyword;
                if (selectedCategory) filters.category_id = selectedCategory;
                if (selectedStatus) filters.status = selectedStatus;
                fetchEventData(currentPage, filters);
            } catch (error) {
                console.error("Error deleting event:", error);
            } finally {
                setLoading(prev => ({ ...prev, delete: false }));
            }
        }
    };

    document.title = " Event | City of Selma";
    return (
        <div className="page-content">
            <Container fluid>
                <Row className="justify-content-between mb-3">
                    <Col xs="auto">
                        <ul className="breadcrumb">
                            <li>
                                <Link to="/"><a href="/">Home /</a></Link>
                            </li>
                            <li className="active">Event List</li>
                        </ul>
                    </Col>
                    <Col xs="auto">
                        <Button color="primary" onClick={toggleModal}>
                            <i className="mdi mdi-plus me-1"></i> Add Event
                        </Button>
                    </Col>
                </Row>

                {/* Search and Filter Form */}
                <form onSubmit={handleFilterSubmit}>
                    <Row className="justify-content-end mb-3">
                        <Col xs="6" md="3">
                            <input
                                type="search"
                                className="form-control"
                                placeholder="Search..."
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                            />
                        </Col>

                        <Col xs="6" md="2">
                            <select
                                className="form-select"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                <option value="">All Categories</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </Col>

                        <Col xs="6" md="2">
                            <select
                                className="form-select"
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                            >
                                <option value="all">All Status</option>
                                <option value="1">Published</option>
                                <option value="0">Unpublished</option>
                                <option value="2">Draft</option>
                            </select>
                        </Col>

                        <Col xs="6" md="1" className="mt-2 mt-md-0">
                            <button type="submit" className="btn btn-primary w-100">
                                Filter
                            </button>
                        </Col>
                    </Row>
                </form>

                {loading.events ? (
                    <div className="text-center my-5">
                        <Spinner color="primary" />
                        <p>Loading events...</p>
                    </div>
                ) : (
                    <>
                        <Row>
                            {events.length > 0 ? (
                                events.map((item, index) => (
                                    <Col key={index} sm={4} md={4} lg={4}>
                                        <Card className="p-1 border shadow-none">
                                            <div className="p-3">
                                                <div className="d-flex justify-content-between">
                                                    <div>
                                                        <h5>
                                                            <Link to={`/event-details/${item.id}`} className="text-dark">
                                                                {item.title.length > 60
                                                                    ? item.title.substring(0, 60) + "..."
                                                                    : item.title}
                                                            </Link>
                                                        </h5>
                                                    </div>
                                                    <div>
                                                        <Link to={`/edit-event/${item.id}`}>
                                                            <i
                                                                className="bx bx-edit align-middle fw-20 text-primary me-2"
                                                                title="Edit"
                                                                style={{ cursor: "pointer" }}
                                                            ></i>
                                                        </Link>
                                                    </div>
                                                </div>
                                                <p className="text-muted mb-0">
                                                    {new Date(item.date).toLocaleDateString("en-GB", {
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
                                                <ul className="list-inline d-flex justify-content">
                                                    <li className="list-inline-item me-3">
                                                        <span className="text-muted">
                                                            <i className="bx bx-purchase-tag-alt align-middle text-muted me-1"></i>
                                                            {item.category?.name || "General"}
                                                        </span>
                                                    </li>
                                                    <li className="list-inline-item me-3">
                                                        <span className="text-muted">
                                                            <i className="bx bx-user align-middle text-muted me-1"></i>
                                                            {item.user?.name || "Admin"}
                                                        </span>
                                                    </li>
                                                </ul>
                                                <p>
                                                    {stripHtml(item.shortdescription).length > 120
                                                        ? stripHtml(item.shortdescription).substring(0, 120) + "..."
                                                        : stripHtml(item.shortdescription)}
                                                </p>
                                                <Row style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                    <Col sm={10} md={10} lg={10}>
                                                        <Link to={`/event-details/${item.id}`} className="text-primary">
                                                            Read more <i className="mdi mdi-arrow-right"></i>
                                                        </Link>
                                                    </Col>
                                                    <Col sm={2} md={2} lg={2} className="text-end fs-4">
                                                        {loading.delete === item.id ? (
                                                            <Spinner size="sm" color="danger" />
                                                        ) : (
                                                            <i className="bx bx-trash align-middle text-danger me-2"
                                                                title="Delete"
                                                                style={{ cursor: 'pointer' }}
                                                                onClick={() => handleDelete(item.id)}
                                                            />
                                                        )}
                                                    </Col>
                                                </Row>
                                            </div>
                                        </Card>
                                    </Col>
                                ))
                            ) : (
                                <Col className="text-center my-5">
                                    <p>No events found matching your criteria</p>
                                </Col>
                            )}
                        </Row>

                        {/* Pagination */}
                        {events.length > 0 && (
                            <div className="text-center mt-4">
                                <ul className="pagination justify-content-end">
                                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                        <button
                                            className="page-link"
                                            onClick={() => {
                                                const filters = {};
                                                if (searchKeyword) filters.keyword = searchKeyword;
                                                if (selectedCategory) filters.category_id = selectedCategory;
                                                if (selectedStatus) filters.status = selectedStatus;
                                                setCurrentPage(currentPage - 1);
                                                fetchEventData(currentPage - 1, filters);
                                            }}
                                        >
                                            &laquo;
                                        </button>
                                    </li>
                                    {Array.from({ length: totalPages }, (_, index) => (
                                        <li
                                            key={index + 1}
                                            className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}
                                        >
                                            <button
                                                className="page-link"
                                                onClick={() => {
                                                    const filters = {};
                                                    if (searchKeyword) filters.keyword = searchKeyword;
                                                    if (selectedCategory) filters.category_id = selectedCategory;
                                                    if (selectedStatus) filters.status = selectedStatus;
                                                    setCurrentPage(index + 1);
                                                    fetchEventData(index + 1, filters);
                                                }}
                                            >
                                                {index + 1}
                                            </button>
                                        </li>
                                    ))}
                                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                        <button
                                            className="page-link"
                                            onClick={() => {
                                                const filters = {};
                                                if (searchKeyword) filters.keyword = searchKeyword;
                                                if (selectedCategory) filters.category_id = selectedCategory;
                                                if (selectedStatus) filters.status = selectedStatus;
                                                setCurrentPage(currentPage + 1);
                                                fetchEventData(currentPage + 1, filters);
                                            }}
                                        >
                                            &raquo;
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </>
                )}

                {/* Add Event Modal */}
                <Modal isOpen={modal} toggle={toggleModal} size="lg">
                    <ModalHeader toggle={toggleModal}>Add Event</ModalHeader>
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
                                            <textarea
                                                className="form-control"
                                                name="shortdescription"
                                                value={formData.shortdescription}
                                                onChange={handleChange}
                                                rows={4}
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
                                            {loading.categories ? (
                                                <div className="text-center">
                                                    <Spinner size="sm" />
                                                </div>
                                            ) : (
                                                <>
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
                                                </>
                                            )}
                                        </Col>

                                        <Col lg={12} className="mt-3">
                                            <label className="form-label">Address</label>
                                            <input
                                                className="form-control"
                                                type="text"
                                                name="address"
                                                value={formData.address}
                                                onChange={handleChange}
                                            />
                                            {errors.address && <span className="text-danger">{errors.address}</span>}
                                        </Col>

                                        <Col lg={12} className="mt-3">
                                            <label className="form-label">Link</label>
                                            <input
                                                className="form-control"
                                                type="text"
                                                name="link"
                                                value={formData.link}
                                                onChange={handleChange}
                                            />
                                            {errors.link && <span className="text-danger">{errors.link}</span>}
                                        </Col>

                                        <Col lg={12} className="mt-3">
                                            <label className="form-label">Date</label>
                                            <input
                                                className="form-control"
                                                type="date"
                                                name="date"
                                                value={formData.date}
                                                onChange={handleChange}
                                            />
                                            {errors.date && <span className="text-danger">{errors.date}</span>}
                                        </Col>

                                        <Col lg={12} className="mt-3">
                                            <label className="form-label">Time</label>
                                            <input
                                                className="form-control"
                                                type="time"
                                                name="time"
                                                value={formData.time}
                                                onChange={handleChange}
                                            />
                                            {errors.time && <span className="text-danger">{errors.time}</span>}
                                        </Col>

                                        <Col lg={12} className="mt-3">
                                            <label className="form-label">Organizor</label>
                                            <input
                                                className="form-control"
                                                type="text"
                                                name="organizor"
                                                value={formData.organizor}
                                                onChange={handleChange}
                                            />
                                            {errors.organizor && <span className="text-danger">{errors.organizor}</span>}
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
                                            <label className="form-label">files (multiple)</label>
                                            <input
                                                className="form-control"
                                                type="file"
                                                name="files"
                                                onChange={handleChange}
                                                multiple
                                            />
                                            {errors.files && <span className="text-danger">{errors.files}</span>}
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

                                        <Col lg={12} className="mt-4 text-center">
                                            <Button type="submit" color="primary" disabled={loading.submit}>
                                                {loading.submit ? (
                                                    <>
                                                        <Spinner size="sm" className="me-2" /> Submitting...
                                                    </>
                                                ) : "Submit"}
                                            </Button>
                                        </Col>
                                    </Col>
                                </Row>
                            </Container>
                        </form>
                    </ModalBody>
                </Modal>
            </Container>
        </div>
    );
};

export default EventList;