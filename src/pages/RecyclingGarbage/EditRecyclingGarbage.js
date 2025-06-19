import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
    Container,
    Row,
    Col,
    Button,
    Alert,
    Card,
    CardBody,
} from "reactstrap";
import axios from "axios";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import BASE_URL from "path"; // Replace with your BASE_URL

const EditRecyclingGarbage = () => {

    const { id } = useParams();
    const [token, setToken] = useState(null);
    const [previewImage, setPreviewImage] = useState("");
    const [errors, setErrors] = useState({});
    const [alertMsg, setAlertMsg] = useState({ type: "", message: "" });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: "",
        shortdescription: "",
        description: "",
        status: "",
        image: null,
    });

    useEffect(() => {
        const storedUser = localStorage.getItem("authUser");
        if (storedUser) {
            const { token } = JSON.parse(storedUser);
            setToken(token);
        }
        fetchData();
        fetchData(id);
    }, [id, token]);

    const fetchData = async (newsId) => {
        try {
            setLoading(true);
            const res = await axios.get(`${BASE_URL}/auth/getRecyclingAndGarbageById/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = res.data.data;
            setFormData({
                title: data.title || "",
                shortdescription: data.shortdescription || "",
                description: data.description || "",
                status: data.status?.toString() || "0",
                image: null,
            });
            setPreviewImage(data.image || "");

            console.log(updatedFormData); // ✅ Logs the correct data
            setFormData(updatedFormData); // ✅ Sets it to state
            setLoading(false);
        } catch (err) {
            console.error("Error fetching item:", err);
            setErrors("Failed to load details");
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "file" ? files[0] : value
        }));

        if (type === "file") {
            const reader = new FileReader();
            reader.onload = () => setPreviewImage(reader.result);
            reader.readAsDataURL(files[0]);
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.title) newErrors.title = "Title is required";
        if (!formData.shortdescription) newErrors.shortdescription = "Short description is required";
        if (!formData.description) newErrors.description = "Description is required";
        if (!formData.status) newErrors.status = "Status is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        const storedUser = localStorage.getItem("authUser");
        const { token } = JSON.parse(storedUser);

        const data = new FormData();
        data.append("id", id);
        data.append("title", formData.title);
        data.append("shortdescription", formData.shortdescription);
        data.append("description", formData.description);
        data.append("status", formData.status);
        if (formData.image) {
            data.append("image", formData.image);
        }

        try {
            const res = await axios.post(`${BASE_URL}/auth/updateRecyclingAndGarbage`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            setAlertMsg({ type: "success", message: "Updated successfully!" });

            setTimeout(() => {
                navigate("/recycling-garbage-list");
            }, 2000);
        } catch (error) {
            console.error("Update error:", error);
            setAlertMsg({ type: "danger", message: "Something went wrong." });
        }
    };
    document.title = "Recycling & Garbage Edit  | City of Selma";
    return (
        <div className="page-content">
            <ul className="breadcrumb">
                <li>
                    <Link to="/"><a href="/">Home /</a></Link>
                </li>
                <li>
                    <Link to="/recycling-garbage-list"><a href="/">Recycling & Garbage list /</a></Link>
                </li>
                <li className="active">Recycling & Garbage Edit</li>
            </ul>
            <Container>
                <form onSubmit={handleSubmit}>
                    <Row className="d-flex justify-content-center">
                        <Col md={12} lg={12}>
                            <Card>
                                <CardBody>
                                    <h3 className="display-4 text-center">Recycling & Garbage</h3>

                                    <Col lg={12} className="mt-3">
                                        <label className="form-label">Title</label>
                                        <input
                                            className="form-control"
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                        />
                                        {errors.title && <div className="text-danger">{errors.title}</div>}
                                    </Col>

                                    <Col lg={12} className="mt-3">
                                        <label className="form-label mt-3">Short Description</label>
                                        <textarea
                                            className="form-control"
                                            name="shortdescription"
                                            value={formData.shortdescription}
                                            onChange={handleChange}
                                            rows={3}
                                        />
                                        {errors.shortdescription && <div className="text-danger">{errors.shortdescription}</div>}
                                    </Col>

                                    <Col lg={12} className="mt-3">
                                        <label className="form-label mt-3">Description</label>
                                        <CKEditor
                                            editor={ClassicEditor}
                                            data={formData.description}
                                            onChange={(event, editor) => {
                                                const content = editor.getData();
                                                setFormData({ ...formData, description: content });
                                            }}
                                        />
                                        {errors.description && <div className="text-danger">{errors.description}</div>}
                                    </Col>

                                    <Col lg={12} className="mt-3">
                                        <label className="form-label mt-3">Status</label>
                                        <select
                                            className="form-control"
                                            name="status"
                                            value={formData.status}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select Status</option>
                                            <option value="1">Published</option>
                                            <option value="0">Unpublished</option>
                                            <option value="2">Draft</option>
                                        </select>
                                        {errors.status && <div className="text-danger">{errors.status}</div>}
                                    </Col>

                                    <Col lg={12} className="mt-3">

                                        <label className="form-label mt-3">Image</label>
                                        <input
                                            className="form-control"
                                            type="file"
                                            name="image"
                                            onChange={handleChange}
                                        />
                                        {previewImage && (
                                            <img
                                                src={previewImage}
                                                alt="Preview"
                                                className="img-thumbnail mt-2"
                                                style={{ maxHeight: "200px" }}
                                            />
                                        )}

                                    </Col>

                                    <Col lg={12} className="mt-4 text-center">
                                        <Button type="submit" color="primary">Submit</Button>
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

export default EditRecyclingGarbage;
