import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
    Card,
    Col,
    Container,
    Alert,
    Spinner,
    CardHeader,
    CardBody,
    Button
} from "reactstrap";
import axios from "axios";
import BASE_URL from "path"; // Replace with your actual BASE_URL import

const PushNotification = () => {
    const [token, setToken] = useState(null);
    const [alertMsg, setAlertMsg] = useState({ type: "", message: "" });
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        image: null
    });

    const [errors, setErrors] = useState({});

    React.useEffect(() => {
        const storedUser = localStorage.getItem("authUser");
        if (storedUser) {
            const { token } = JSON.parse(storedUser);
            setToken(token);
        }
    }, []);

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "file" ? files[0] : value,
        }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = "Title is required";
        if (!formData.description.trim()) newErrors.description = "Description is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);

        const data = new FormData();
        data.append("title", formData.title);
        data.append("body", formData.description);
        if (formData.image) {
            data.append("image", formData.image);
        }

        try {
            const response = await axios.post(
                `${BASE_URL}/auth/sendnotification`, // Update with your actual notification endpoint
                data,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setAlertMsg({ type: "success", message: "Notification sent successfully!" });
            setFormData({
                title: "",
                description: "",
                image: null
            });
        } catch (error) {
            console.error("API error:", error);
            setAlertMsg({ type: "danger", message: "Failed to send notification!" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-content">
            <Col xs="auto">
                <ul className="breadcrumb">
                    <li>
                        <Link to="/">Home /</Link>
                    </li>
                    <li className="active">Push Notification</li>
                </ul>
            </Col>

            <Container>
                <Card>
                    <CardHeader>
                        <h4>Push Notification <small className="text-muted">(Send to all app users)</small></h4>
                    </CardHeader>
                    <CardBody>
                        <form onSubmit={handleSubmit}>
                            {alertMsg.message && (
                                <Alert color={alertMsg.type}>{alertMsg.message}</Alert>
                            )}

                            <div className="mb-3">
                                <label className="form-label">Title*</label>
                                <input
                                    className="form-control"
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                />
                                {errors.title && <span className="text-danger">{errors.title}</span>}
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Description*</label>
                                <textarea
                                    className="form-control"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={4}
                                />
                                {errors.description && (
                                    <span className="text-danger">{errors.description}</span>
                                )}
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Image (Optional)</label>
                                <input
                                    className="form-control"
                                    type="file"
                                    name="image"
                                    accept="image/*"
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="text-center mt-4">
                                <Button type="submit" color="primary" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <Spinner size="sm" className="me-2" /> Sending...
                                        </>
                                    ) : (
                                        "Send Notification"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardBody>
                </Card>
            </Container>
        </div>
    );
};

export default PushNotification;