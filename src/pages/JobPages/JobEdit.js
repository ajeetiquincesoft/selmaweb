import React, { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
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
import BASE_URL from "path"; // Replace with your actual base URL
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { useNavigate } from "react-router-dom";
const JobEdit = () => {
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
    }, []);

    useEffect(() => {
        if (token) {
            fetchCategories();
            fetchJobById(id);
        }
    }, [token]);

    const fetchJobById = async (jobId) => {
        try {
            setLoading(true);
            const response = await axios.get(`${BASE_URL}/auth/getjobById/${jobId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const jobData = response.data.data;
            setFormData({
                title: jobData.title || "",
                shortdescription: jobData.shortdescription || "",
                description: jobData.description || "",
                category_id: jobData.category_id || "",
                status: String(jobData.status) || "",
                featured_image: jobData.featured_image || "",
                link: jobData.link || "",
                apply_link: jobData.apply_link || "",

            });
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch job details", err);
            setErrors("Failed to load job details");
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/auth/getalljobcategory`, {
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
                    ? files
                    : files[0]
                : value,
        }));
    };

    const handleCKEditorChange = (name, data) => {
        setFormData((prev) => ({ ...prev, [name]: data }));
    };

    const handleRemoveImage = (index) => {
        const newImages = [...formData.images];
        newImages.splice(index, 1);
        setFormData({ ...formData, images: newImages });
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.title) newErrors.title = "Title is required";
        if (!formData.description) newErrors.description = "Description is required";
        // if (!formData.shortdescription) newErrors.shortdescription = "Short description is required";
        if (!formData.featured_image) newErrors.featured_image = "Featured image is required";
        if (!formData.category_id) newErrors.category_id = "Category is required";
        if (!formData.status) newErrors.status = "Status is required";
        // if (!formData.link) newErrors.link = "link is required";
        // if (!formData.apply_link) newErrors.apply_link = "apply link is required";
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
        formPayload.append("link", formData.link || "");
        formPayload.append("apply_link", formData.apply_link || "");
        
        if (formData.featured_image instanceof File) {
            formPayload.append("featured_image", formData.featured_image);
        }
        formPayload.append("published_at", dateTimeString);
        try {
            const response = await axios.post(`${BASE_URL}/auth/updatejob`, formPayload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });
            if (response.data.success) {
                setAlertMsg({ message: "Job updated successfully", type: "success" });
                setTimeout(() => {
                    navigate("/job-list");
                }, 2000); // Optional delay to show alert
            } else {
                setAlertMsg({ message: "Failed to update job", type: "danger" });
            }
        } catch (error) {
            console.error("Update error", error);
            setAlertMsg({ message: "Error updating job", type: "danger" });
        }
    };
    document.title = "Job Edit | City of Selma";
    return (
        <div className="page-content">
            <ul className="breadcrumb">
                <li>
                    <Link to="/"><a href="/">Home /</a></Link>
                </li>
                <li>
                    <Link to="/job-list"><a href="/">Jobs List /</a></Link>
                </li>
                <li className="active">Job Edit</li>
            </ul>
            <Container>

                <form onSubmit={handleSubmit}>
                    <Row className="d-flex justify-content-center">
                        <Col md={12} lg={12}>
                            <Card>
                                <CardBody>
                                    <h3 className="display-5 text-center">Job</h3>

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
                                                handleCKEditorChange("description", editor.getData());
                                            }}
                                        />
                                        {errors.description && <span className="text-danger">{errors.description}</span>}
                                    </Col>

                                    <Col lg={12} className="mt-3">
                                        <label className="form-label">Category</label>
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
                                        <label className="form-label">Status</label>
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
                                        {typeof formData.featured_image === 'string' && (
                                            <div className="mt-2">
                                                <img src={formData.featured_image} alt="Preview" className="img-thumbnail" style={{ height: 100 }} />
                                            </div>
                                        )}
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
                                        {errors.title && <span className="text-danger">{errors.link}</span>}
                                    </Col>

                                    <Col lg={12} className="mt-3">
                                        <label className="form-label">Apply Link</label>
                                        <input
                                            className="form-control"
                                            type="text"
                                            name="apply_link"
                                            value={formData.apply_link}
                                            onChange={handleChange}
                                        />
                                        {errors.title && <span className="text-danger">{errors.apply_link}</span>}
                                    </Col>


                                    <Col lg={12} className="mt-4 text-center">
                                        <Button type="submit" color="primary">Update Job</Button>
                                    </Col>
                                    {alertMsg.message && (
                                        <Alert color={alertMsg.type}>{alertMsg.message}</Alert>
                                    )}
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </form>
            </Container>
        </div>
    );
};

export default JobEdit;
