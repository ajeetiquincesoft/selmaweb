import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Card, Col, Row, Button, Modal, ModalHeader, ModalBody, Container, Alert, Badge, Table
} from "reactstrap";
import axios from "axios";
import BASE_URL from "path"; // Update to your actual BASE_URL
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

const EditPark = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [token, setToken] = useState(null);
    const [categories, setCategories] = useState([]);
    const [errors, setErrors] = useState({});
    const [alertMsg, setAlertMsg] = useState({ type: "", message: "" });
    const [initialFacilities, setInitialFacilities] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [removedImages, setRemovedImages] = useState([]);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        shortdescription: "",
        featured_image: null,
        images: [],
        category_id: "",
        status: "",
        link: "",
        date: "",
        time: "",
        organizer: "",
        published_at: ""
    });

    const [facilities, setFacilities] = useState([
        { name: "", address: "", amenities: [""] }
    ]);

    useEffect(() => {
        const storedUser = localStorage.getItem("authUser");
        if (storedUser) {
            const { token } = JSON.parse(storedUser);
            setToken(token);
        }
        fetchCategories();
        fetchParkData();
    }, [id, token]);

    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/auth/getAllParksAndRecreationCategories`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCategories(response.data.data || []);
        } catch (err) {
            console.error("Failed to fetch categories", err);
        }
    };

    const fetchParkData = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/auth/getAllParksAndRecreationById/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const parkData = response.data.data;
            const parsedFacilities = typeof parkData.facilities === 'string'
                ? JSON.parse(parkData.facilities)
                : parkData.facilities || [];

            setFormData({
                title: parkData.title || "",
                description: parkData.description || "",
                shortdescription: parkData.shortdescription || "",
                category_id: parkData.category_id || "",
                status: parkData.status?.toString() || "",
                link: parkData.link || "",
                date: parkData.date || "",
                time: parkData.time || "",
                organizer: parkData.organizer || "",
                published_at: parkData.published_at ? new Date(parkData.published_at).toISOString().slice(0, 16) : "",
                featured_image: null,
                images: []
            });

            setExistingImages(parkData.images || []);
            setFacilities(parsedFacilities.length > 0 ? parsedFacilities : [{ name: "", address: "", amenities: [""] }]);
            setInitialFacilities(parsedFacilities);

        } catch (err) {
            console.error("Failed to fetch park data", err);
            setAlertMsg({ type: "danger", message: "Failed to load park data" });
        }
    };

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "file"
                ? name === "images"
                    ? Array.from(files)
                    : files[0]
                : value,
        }));
    };

    const handleFacilityChange = (index, e) => {
        const { name, value } = e.target;
        const updatedFacilities = [...facilities];
        updatedFacilities[index] = {
            ...updatedFacilities[index],
            [name]: value
        };
        setFacilities(updatedFacilities);
    };

    const handleAmenityChange = (facilityIndex, amenityIndex, value) => {
        const updatedFacilities = [...facilities];
        updatedFacilities[facilityIndex] = {
            ...updatedFacilities[facilityIndex],
            amenities: updatedFacilities[facilityIndex].amenities.map((a, i) =>
                i === amenityIndex ? value : a
            )
        };
        setFacilities(updatedFacilities);
    };

    const addFacility = () => {
        setFacilities([...facilities, { name: "", address: "", amenities: [""] }]);
    };

    const removeFacility = (index) => {
        if (facilities.length <= 1) {
            setAlertMsg({ type: "danger", message: "At least one facility is required" });
            return;
        }
        const updatedFacilities = [...facilities];
        updatedFacilities.splice(index, 1);
        setFacilities(updatedFacilities);
    };

    const addAmenity = (facilityIndex) => {
        const updatedFacilities = [...facilities];
        updatedFacilities[facilityIndex] = {
            ...updatedFacilities[facilityIndex],
            amenities: [...updatedFacilities[facilityIndex].amenities, ""]
        };
        setFacilities(updatedFacilities);
    };

    const removeAmenity = (facilityIndex, amenityIndex) => {
        const updatedFacilities = [...facilities];
        if (updatedFacilities[facilityIndex].amenities.length <= 1) {
            setAlertMsg({ type: "danger", message: "At least one amenity is required" });
            return;
        }
        updatedFacilities[facilityIndex] = {
            ...updatedFacilities[facilityIndex],
            amenities: updatedFacilities[facilityIndex].amenities.filter((_, i) => i !== amenityIndex)
        };
        setFacilities(updatedFacilities);
    };

    const removeExistingImage = (imageIndex) => {
        const imageToRemove = existingImages[imageIndex];
        setRemovedImages([...removedImages, imageToRemove]);
        setExistingImages(existingImages.filter((_, index) => index !== imageIndex));
    };

    const validate = () => {
         console.log('aasd');
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = "Title is required";
        if (!formData.shortdescription.trim()) newErrors.shortdescription = "Short description is required";
        if (!formData.description.trim()) newErrors.description = "Description is required";
        if (!formData.link.trim()) newErrors.link = "Link is required";
        if (!formData.date) newErrors.date = "Date is required";
        if (!formData.time) newErrors.time = "Time is required";
        if (!formData.organizer.trim()) newErrors.organizer = "Organizer is required";
        if (!formData.published_at) newErrors.published_at = "Publish date/time required";
        if (!formData.category_id) newErrors.category_id = "Category is required";
        if (!formData.status) newErrors.status = "Status is required";

        // Validate facilities
        if (facilities.length === 0) {
            newErrors.facilities = "At least one facility is required";
        } else {
            facilities.forEach((facility, index) => {
                if (!facility.name.trim()) {
                    newErrors[`facility_${index}_name`] = "Facility name is required";
                }
                if (!facility.address.trim()) {
                    newErrors[`facility_${index}_address`] = "Facility address is required";
                }
                if (facility.amenities.length === 0 || facility.amenities.some(a => !a.trim())) {
                    newErrors[`facility_${index}_amenities`] = "At least one valid amenity is required";
                }
            });
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        console.log('aasd');
        e.preventDefault();
        if (!validate()) return;

        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            if (key === "images") {
                Array.from(value).forEach(file => {
                    data.append("images", file);
                });
            } else if (key === "featured_image" && value) {
                data.append("featured_image", value);
            } else if (value !== null && value !== undefined) {
                data.append(key, value);
            }
        });

        data.append("facilities", JSON.stringify(facilities));
        existingImages.forEach(image => data.append("existing_images[]", image));
        removedImages.forEach(image => data.append("removed_images[]", image));
        data.append("id", id);

        try {
            await axios.post(`${BASE_URL}/auth/updateParksAndRecreation`,
                data,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${token}`,
                    },
                });

            setAlertMsg({ type: "success", message: "Park updated successfully!" });
            setTimeout(() => navigate(-1), 1500);
        } catch (error) {
            console.error("API error:", error);
            setAlertMsg({
                type: "danger",
                message: error.response?.data?.message || "Failed to update park"
            });
        }
    };

    return (
        <div className="page-content">
            <Container>
                <Row className="mb-4">
                    <Col>
                        <Button color="secondary" onClick={() => navigate(-1)}>
                            <i className="mdi mdi-arrow-left me-1"></i> Back
                        </Button>
                    </Col>
                </Row>

                <Card className="p-4 shadow">
                    <h3 className="mb-4">Edit Park: {formData.title}</h3>

                    {alertMsg.message && (
                        <Alert color={alertMsg.type} className="mb-4" toggle={() => setAlertMsg({ type: "", message: "" })}>
                            {alertMsg.message}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <Row>
                            <Col md={12}>
                                {/* Basic Information */}
                                <Card className="p-3 mb-4">
                                    <h5 className="mb-3">Basic Information</h5>

                                    <div className="mb-3">
                                        <label className="form-label">Title*</label>
                                        <input
                                            type="text"
                                            className={`form-control ${errors.title ? "is-invalid" : ""}`}
                                            name="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                        />
                                        {errors.title && <div className="invalid-feedback">{errors.title}</div>}
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Short Description*</label>
                                        <textarea
                                            className={`form-control ${errors.shortdescription ? "is-invalid" : ""}`}
                                            name="shortdescription"
                                            rows={3}
                                            value={formData.shortdescription}
                                            onChange={handleChange}
                                        />
                                        {errors.shortdescription && (
                                            <div className="invalid-feedback">{errors.shortdescription}</div>
                                        )}
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Description*</label>
                                        <CKEditor
                                            editor={ClassicEditor}
                                            data={formData.description}
                                            onChange={(event, editor) =>
                                                setFormData({ ...formData, description: editor.getData() })
                                            }
                                        />
                                        {errors.description && (
                                            <small className="text-danger">{errors.description}</small>
                                        )}
                                    </div>
                                </Card>

                                {/* Event Information */}
                                <Card className="p-3 mb-4">
                                    <h5 className="mb-3">Event Information</h5>

                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Date*</label>
                                            <input
                                                type="date"
                                                className={`form-control ${errors.date ? "is-invalid" : ""}`}
                                                name="date"
                                                value={formData.date?.split('T')[0] || ""}
                                                onChange={handleChange}
                                            />
                                            {errors.date && <div className="invalid-feedback">{errors.date}</div>}
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Time*</label>
                                            <input
                                                type="time"
                                                className={`form-control ${errors.time ? "is-invalid" : ""}`}
                                                name="time"
                                                value={formData.time}
                                                onChange={handleChange}
                                            />
                                            {errors.time && <div className="invalid-feedback">{errors.time}</div>}
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Organizer*</label>
                                        <input
                                            type="text"
                                            className={`form-control ${errors.organizer ? "is-invalid" : ""}`}
                                            name="organizer"
                                            value={formData.organizer}
                                            onChange={handleChange}
                                        />
                                        {errors.organizer && (
                                            <div className="invalid-feedback">{errors.organizer}</div>
                                        )}
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Website Link*</label>
                                        <input
                                            type="text"
                                            className={`form-control ${errors.link ? "is-invalid" : ""}`}
                                            name="link"
                                            value={formData.link}
                                            onChange={handleChange}
                                        />
                                        {errors.link && <div className="invalid-feedback">{errors.link}</div>}
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Publish Date/Time*</label>
                                        <input
                                            type="datetime-local"
                                            className={`form-control ${errors.published_at ? "is-invalid" : ""}`}
                                            name="published_at"
                                            value={formData.published_at}
                                            onChange={handleChange}
                                        />
                                        {errors.published_at && (
                                            <div className="invalid-feedback">{errors.published_at}</div>
                                        )}
                                    </div>
                                </Card>
                            </Col>

                            <Col md={12}>
                                {/* Category and Status */}
                                <Card className="p-3 mb-4">
                                    <h5 className="mb-3">Settings</h5>

                                    <div className="mb-3">
                                        <label className="form-label">Category*</label>
                                        <select
                                            className={`form-control ${errors.category_id ? "is-invalid" : ""}`}
                                            name="category_id"
                                            value={formData.category_id}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map((cat) => (
                                                <option key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.category_id && (
                                            <div className="invalid-feedback">{errors.category_id}</div>
                                        )}
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Status*</label>
                                        <select
                                            className={`form-control ${errors.status ? "is-invalid" : ""}`}
                                            name="status"
                                            value={formData.status}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select Status</option>
                                            <option value="0">Unpublished</option>
                                            <option value="2">Draft</option>
                                            <option value="1">Published</option>
                                        </select>
                                        {errors.status && (
                                            <div className="invalid-feedback">{errors.status}</div>
                                        )}
                                    </div>
                                </Card>

                                {/* Images */}
                                <Card className="p-3 mb-4">
                                    <h5 className="mb-3">Images</h5>

                                    <div className="mb-3">
                                        <label className="form-label">Featured Image</label>
                                        <input
                                            type="file"
                                            className="form-control"
                                            name="featured_image"
                                            onChange={handleChange}
                                            accept="image/*"
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Additional Images</label>
                                        <input
                                            type="file"
                                            className="form-control"
                                            name="images"
                                            onChange={handleChange}
                                            multiple
                                            accept="image/*"
                                        />
                                    </div>

                                    {existingImages.length > 0 && (
                                        <div className="mb-3">
                                            <label className="form-label">Current Images</label>
                                            <Table bordered size="sm">
                                                <thead>
                                                    <tr>
                                                        <th>Image</th>
                                                        <th>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {existingImages.map((image, index) => (
                                                        <tr key={index}>
                                                            <td>
                                                                <img
                                                                    src={image}
                                                                    alt={`Existing ${index}`}
                                                                    style={{ maxWidth: "100px", maxHeight: "60px" }}
                                                                />
                                                            </td>
                                                            <td>
                                                                <Button
                                                                    color="danger"
                                                                    size="sm"
                                                                    onClick={() => removeExistingImage(index)}
                                                                >
                                                                    Remove
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                        </div>
                                    )}
                                </Card>

                                {/* Facilities */}
                                <Card className="p-3 mb-4">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h5 className="mb-0">Facilities</h5>
                                        <Button color="primary" size="sm" onClick={addFacility}>
                                            Add Facility
                                        </Button>
                                    </div>

                                    {errors.facilities && (
                                        <Alert color="danger" className="mb-3">
                                            {errors.facilities}
                                        </Alert>
                                    )}

                                    {facilities.map((facility, facilityIndex) => (
                                        <Card key={facilityIndex} className="p-3 mb-3 border">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <h6 className="mb-0">Facility #{facilityIndex + 1}</h6>
                                                <Button
                                                    color="danger"
                                                    size="sm"
                                                    onClick={() => removeFacility(facilityIndex)}
                                                >
                                                    Remove
                                                </Button>
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label">Name*</label>
                                                <input
                                                    type="text"
                                                    className={`form-control ${errors[`facility_${facilityIndex}_name`] ? "is-invalid" : ""}`}
                                                    name="name"
                                                    value={facility.name}
                                                    onChange={(e) => handleFacilityChange(facilityIndex, e)}
                                                />
                                                {errors[`facility_${facilityIndex}_name`] && (
                                                    <div className="invalid-feedback">{errors[`facility_${facilityIndex}_name`]}</div>
                                                )}
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label">Address*</label>
                                                <input
                                                    type="text"
                                                    className={`form-control ${errors[`facility_${facilityIndex}_address`] ? "is-invalid" : ""}`}
                                                    name="address"
                                                    value={facility.address}
                                                    onChange={(e) => handleFacilityChange(facilityIndex, e)}
                                                />
                                                {errors[`facility_${facilityIndex}_address`] && (
                                                    <div className="invalid-feedback">{errors[`facility_${facilityIndex}_address`]}</div>
                                                )}
                                            </div>

                                            <div className="mb-3">
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <label className="form-label mb-0">Amenities*</label>
                                                    <Button
                                                        color="info"
                                                        size="sm"
                                                        onClick={() => addAmenity(facilityIndex)}
                                                    >
                                                        Add Amenity
                                                    </Button>
                                                </div>

                                                {errors[`facility_${facilityIndex}_amenities`] && (
                                                    <div className="text-danger mb-2">
                                                        {errors[`facility_${facilityIndex}_amenities`]}
                                                    </div>
                                                )}

                                                {facility.amenities.map((amenity, amenityIndex) => (
                                                    <div key={amenityIndex} className="input-group mb-2">
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={amenity}
                                                            onChange={(e) =>
                                                                handleAmenityChange(facilityIndex, amenityIndex, e.target.value)
                                                            }
                                                        />
                                                        <Button
                                                            color="danger"
                                                            onClick={() => removeAmenity(facilityIndex, amenityIndex)}
                                                        >
                                                            ×
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </Card>
                                    ))}
                                </Card>
                            </Col>

                            <Col lg={12} className="mt-4 text-center">
                                <Button type="submit" color="primary">Submit</Button>
                            </Col>

                        </Row>
                    </form>
                </Card>
            </Container>
        </div>
    );
};

export default EditPark;