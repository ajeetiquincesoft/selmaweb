import React, { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
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
} from "reactstrap";
import BASE_URL from "path"; // Replace this with your actual BASE_URL import
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const NewsEdit = () => {
    const { id } = useParams();
    const [token, setToken] = useState(null);
    const [categories, setCategories] = useState([]);
    const [errors, setErrors] = useState({});
    const [alertMsg, setAlertMsg] = useState({ type: "", message: "" });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        shortdescription: "",
        featured_image: null,
        images: [],
        category_id: "",
        status: ""
    });

    useEffect(() => {
        const storedUser = localStorage.getItem("authUser");
        if (storedUser) {
            const { token } = JSON.parse(storedUser);
            setToken(token);
        }
        fetchCategories();
        fetchNewsById(id);
    }, [id]);

    const fetchNewsById = async (newsId) => {
        try {
            setLoading(true);
            const response = await axios.get(`${BASE_URL}/auth/getNewsById/${newsId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const newsData = response.data.data;
            const updatedFormData = {
                title: newsData.title || "",
                shortdescription: newsData.shortdescription || "",
                description: newsData.description || "",
                category_id: newsData.category_id || "",
                status: String(newsData.status) || "",
                featured_image: newsData.featured_image || "",
                images: newsData.images || [],
            };

            setFormData(updatedFormData);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch news details", err);
            setErrors("Failed to load news details");
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/auth/getallnewscategory`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
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
        if (!formData.category_id) newErrors.category_id = "Category is required";
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
        formPayload.append("shortdescription", formData.shortdescription || "");
        formPayload.append("description", formData.description);
        formPayload.append("category_id", formData.category_id);
        formPayload.append("status", formData.status);

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
            formPayload.append("images", img);
        });

        formPayload.append("published_at", dateTimeString);

        try {
            const response = await axios.post(`${BASE_URL}/auth/updatenews`, formPayload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.data.success) {
                setAlertMsg({ message: "News updated successfully", type: "success" });
                setTimeout(() => {
                    navigate("/news-list");
                }, 2000);
            } else {
                setAlertMsg({ message: response.data.message || "Failed to update news", type: "danger" });
            }
        } catch (error) {
            console.error("Update error", error);
            setAlertMsg({
                message: error.response?.data?.message || "Error updating news",
                type: "danger"
            });
        }
    };

    return (
        <div className="page-content">
            <ul className="breadcrumb">
                <li>
                    <Link to="/">Home /</Link>
                </li>
                <li>
                    <Link to="/news-list">News List /</Link>
                </li>
                <li className="active">News Edit</li>
            </ul>

            <Container>
                {loading ? (
                    <div className="text-center">Loading...</div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <Row className="d-flex justify-content-center">
                            <Col md={12} lg={12}>
                                <Card>
                                    <CardBody>
                                        <h2 className="display-4 text-center">Edit News</h2>

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
                                                    setFormData(prev => ({ ...prev, description: data }));
                                                }}
                                            />
                                            {errors.description && <span className="text-danger">{errors.description}</span>}
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
                                                accept="image/*"
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
                                                {loading ? 'Updating...' : 'Update News'}
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

export default NewsEdit;