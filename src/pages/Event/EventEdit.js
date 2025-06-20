import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom"
import {
    Card,
    CardBody,
    Col,
    Container,
    Row,
    Button,
    Alert,
} from "reactstrap";
import BASE_URL from "path"; // Replace this with your actual BASE_URL import
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { useNavigate } from "react-router-dom";

const EventEdit = () => {
    const { id } = useParams();
    const [token, setToken] = useState(null);
    const [categories, setCategories] = useState([]);
    const [errors, setErrors] = useState({});
    const [alertMsg, setAlertMsg] = useState({ type: "", message: "" });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: "",
        shortdescription: "",
        description: "",
        featured_image: null,
        images: [],
        link: "",
        address: "",
        category_id: "",
        date: "",
        time: "",
        organizor: "",
        status: ""
    });

    useEffect(() => {
        const storedUser = localStorage.getItem("authUser");
        if (storedUser) {
            const { token } = JSON.parse(storedUser);
            setToken(token);
        }
        fetchCategories();
        fetchEventById(id);
    }, [id]);

    const fetchEventById = async (eventId) => {
        try {
            setLoading(true);
            const response = await axios.get(`${BASE_URL}/auth/getEventById/${eventId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const eventData = response.data.data;
            const updatedFormData = {
                title: eventData.title || "",
                shortdescription: eventData.shortdescription || "",
                description: eventData.description || "",
                date: eventData.date || "",
                address: eventData.address || "",
                category_id: eventData.category_id || "",
                status: String(eventData.status) || "",
                featured_image: eventData.featured_image || "",
                images: eventData.files || [],
                link: eventData.link || "",
                time: eventData.time || "",
                organizor: eventData.organizor || "",
            };
            setFormData(updatedFormData);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch event details", err);
            setErrors("Failed to load event details");
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/auth/getalleventcategory`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCategories(response.data.data || []);
        } catch (err) {
            console.error("Failed to fetch categories", err);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "file"
                ? name === "images"
                    ? [...(prev.images || []), ...Array.from(files)] // Add new files to existing images
                    : files[0]
                : value,
        }));
    };

    const handleRemoveImage = (index) => {
        setFormData(prev => {
            const newImages = [...prev.images];
            newImages.splice(index, 1);
            return { ...prev, images: newImages };
        });
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.title) newErrors.title = "Title is required";
        if (!formData.description) newErrors.description = "Description is required";
        if (!formData.address) newErrors.address = "Address is required";
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
        const now = new Date();
        const dateTimeString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
            now.getDate()
        ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(
            now.getMinutes()
        ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

        const formPayload = new FormData();

        formPayload.append("id", id);
        formPayload.append("title", formData.title);
        formPayload.append("description", formData.description);
        formPayload.append("shortdescription", formData.shortdescription || "");

        // Handle featured image
        if (formData.featured_image instanceof File) {
            formPayload.append("featured_image", formData.featured_image);
        }

        // Separate existing images (strings) from new images (File objects)
        const existingImages = formData.images.filter(img => typeof img === 'string');
        const newImages = formData.images.filter(img => img instanceof File);

        // Send existing images that weren't removed
        if (existingImages.length > 0) {
            formPayload.append("existing_images", JSON.stringify(existingImages));
        }

        // Send new images
        newImages.forEach(img => {
            formPayload.append("files", img);
        });

        formPayload.append("link", formData.link || "");
        formPayload.append("address", formData.address);
        formPayload.append("category_id", formData.category_id);
        formPayload.append("date", formData.date);
        formPayload.append("time", formData.time);
        formPayload.append("organizor", formData.organizor);
        formPayload.append("status", formData.status);
        formPayload.append("published_at", dateTimeString);

        try {
            const response = await axios.post(`${BASE_URL}/auth/updateevent`,
                formPayload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                });

            if (response.data.success) {
                setAlertMsg({ message: "Event updated successfully", type: "success" });
                setTimeout(() => {
                    navigate("/event-list");
                }, 2000);
            } else {
                setAlertMsg({ message: response.data.message || "Failed to update event", type: "danger" });
            }
        } catch (error) {
            console.error("Update error", error);
            setAlertMsg({
                message: error.response?.data?.message || "Error updating event",
                type: "danger"
            });
        }
    };

    document.title = " Event Edit | City of Selma";
    return (
        <div className="page-content">
            <ul className="breadcrumb">
                <li>
                    <Link to="/"><a href="/">Home /</a></Link>
                </li>
                <li>
                    <Link to="/event-list"><a href="">Event List /</a></Link>
                </li>
                <li className="active">Event Details</li>
            </ul>
            <Container>
                {loading ? (
                    <div className="text-center">Loading...</div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <Row className="d-flex justify-content-center">
                            <Col md={12}>
                                <Card>
                                    <CardBody>
                                        <h2 className="display-4 text-center">Event</h2>

                                        {alertMsg.message && (
                                            <Alert color={alertMsg.type}>{alertMsg.message}</Alert>
                                        )}

                                        <Col lg={12} className="mt-3">
                                            <label className="form-label">Title *</label>
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
                                            <label className="form-label">Description *</label>
                                            <CKEditor
                                                editor={ClassicEditor}
                                                data={formData.description}
                                                onChange={(event, editor) => {
                                                    const data = editor.getData();
                                                    setFormData((prev) => ({ ...prev, description: data }));
                                                }}
                                            />
                                            {errors.description && <span className="text-danger">{errors.description}</span>}
                                        </Col>

                                        <Col lg={12} className="mt-3">
                                            <label className="form-label">Date *</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                name="date"
                                                value={formData.date?.split('T')[0] || ""}
                                                onChange={handleChange}
                                            />
                                            {errors.date && <span className="text-danger">{errors.date}</span>}
                                        </Col>

                                        <Col lg={12} className="mt-3">
                                            <label className="form-label">Category *</label>
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
                                            <label className="form-label">Address *</label>
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
                                            <label className="form-label">Status *</label>
                                            <select
                                                className="form-control"
                                                name="status"
                                                value={formData.status}
                                                onChange={handleChange}
                                            >
                                                <option value="">Select Status</option>
                                                <option value="0">Unpublished</option>
                                                <option value="1">Published</option>
                                                <option value="2">Draft</option>
                                            </select>
                                            {errors.status && <span className="text-danger">{errors.status}</span>}
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
                                            {formData.featured_image && (
                                                <div className="mt-2">
                                                    <img
                                                        src={typeof formData.featured_image === 'string'
                                                            ? formData.featured_image
                                                            : URL.createObjectURL(formData.featured_image)}
                                                        alt="Featured Preview"
                                                        className="img-thumbnail"
                                                        style={{ height: 100 }}
                                                    />
                                                </div>
                                            )}
                                        </Col>

                                        <Col lg={12} className="mt-3">
                                            <label className="form-label">Additional Images</label>
                                            <input
                                                className="form-control"
                                                type="file"
                                                name="images"
                                                onChange={handleChange}
                                                multiple
                                                accept="image/*"
                                            />
                                            {errors.images && <span className="text-danger">{errors.images}</span>}
                                            <div className="d-flex flex-wrap gap-2 mt-2">
                                                {formData.images.map((img, index) => (
                                                    <div key={index} className="position-relative">
                                                        <img
                                                            src={typeof img === 'string'
                                                                ? img
                                                                : URL.createObjectURL(img)}
                                                            alt={`Preview ${index}`}
                                                            className="img-thumbnail"
                                                            style={{ height: 100 }}
                                                        />
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-danger position-absolute top-0 end-0"
                                                            onClick={() => handleRemoveImage(index)}
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </Col>

                                        <Col lg={12} className="mt-4 text-center">
                                            <Button type="submit" color="primary" disabled={loading}>
                                                {loading ? 'Updating...' : 'Update Event'}
                                            </Button>
                                        </Col>
                                        {alertMsg.message && (
                                            <Alert color={alertMsg.type}>{alertMsg.message}</Alert>
                                        )}
                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>
                    </form>
                )}
            </Container>
        </div>
    );
};

export default EventEdit;