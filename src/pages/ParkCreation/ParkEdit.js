import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
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
        organizor: "",
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
                organizor: parkData.organizor || "",
                published_at: parkData.published_at ? new Date(parkData.published_at).toISOString().slice(0, 16) : "",
                featured_image: parkData.featured_image,
                images: parkData.images || [],
            });
            setFacilities(parsedFacilities.length > 0 ? parsedFacilities : [{ name: "", address: "", amenities: [""] }]);
            setInitialFacilities(parsedFacilities);

        } catch (err) {
            console.error("Failed to fetch park data", err);
            setAlertMsg({ type: "danger", message: "Failed to load park data" });
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

    const handleRemoveImage = (index) => {
        setFormData(prev => {
            const newImages = [...prev.images];
            newImages.splice(index, 1);
            return { ...prev, images: newImages };
        });
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = "Title is required";
        // if (!formData.shortdescription.trim()) newErrors.shortdescription = "Short description is required";
        if (!formData.description.trim()) newErrors.description = "Description is required";
        // if (!formData.link.trim()) newErrors.link = "Link is required";
        // if (!formData.date) newErrors.date = "Date is required";
        // if (!formData.time) newErrors.time = "Time is required";
        // if (!formData.organizor.trim()) newErrors.organizor = "Organizer is required";
        // if (!formData.published_at) newErrors.published_at = "Publish date/time required";
        if (!formData.category_id) newErrors.category_id = "Category is required";
        if (!formData.status) newErrors.status = "Status is required";

        // Validate facilities
        // if (facilities.length === 0) {
        //     newErrors.facilities = "At least one facility is required";
        // } else {
        //     facilities.forEach((facility, index) => {
        //         if (!facility.name.trim()) {
        //             newErrors[`facility_${index}_name`] = "Facility name is required";
        //         }
        //         if (!facility.address.trim()) {
        //             newErrors[`facility_${index}_address`] = "Facility address is required";
        //         }
        //         if (facility.amenities.length === 0 || facility.amenities.some(a => !a.trim())) {
        //             newErrors[`facility_${index}_amenities`] = "At least one valid amenity is required";
        //         }
        //     });
        // }

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

        const data = new FormData();
        if (formData.featured_image instanceof File) {
            data.append("featured_image", formData.featured_image);
        }

        const existingImages = formData.images.filter(img => typeof img === 'string');
        const newImages = formData.images.filter(img => img instanceof File);

        // Send existing images that weren't removed
        if (existingImages.length > 0) {
            data.append("existing_images", JSON.stringify(existingImages));
        }

        // Send new images
        newImages.forEach(img => {
            data.append("images", img);
        });

        data.append("published_at", dateTimeString);

        data.append("facilities", JSON.stringify(facilities));
        data.append("id", id);


        data.append("published_at", dateTimeString);

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
            setTimeout(() => {
                navigate("/parks-recreation-list");
            }, 2000); // Optional delay to show alert
        } catch (error) {
            console.error("API error:", error);
            setAlertMsg({
                type: "danger",
                message: error.response?.data?.message || "Failed to update park"
            });
        }
    };
    document.title = "Parks & Recreation Edit  | City of Selma";
    return (
        <div className="page-content">
            <ul className="breadcrumb">
                <li>
                    <Link to="/"><a href="/">Home /</a></Link>
                </li>
                <li>
                    <Link to="/parks-recreation-list"><a href="/">Parks & Recreation List /</a></Link>
                </li>
                <li className="active">Parks & Recreation Edit</li>
            </ul>
            <Container>


                <Card className="p-4 shadow">
                    <h3 className="mb-4">Edit</h3>
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
                                            className={`form-control ${errors.organizor ? "is-invalid" : ""}`}
                                            name="organizor"
                                            value={formData.organizor}
                                            onChange={handleChange}
                                        />
                                        {errors.organizor && (
                                            <div className="invalid-feedback">{errors.organizor}</div>
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
                                    </div>

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
                                <Button type="submit" color="primary">Update</Button>
                            </Col>
                            {alertMsg.message && (
                                <Alert color={alertMsg.type} className="mb-4" toggle={() => setAlertMsg({ type: "", message: "" })}>
                                    {alertMsg.message}
                                </Alert>
                            )}
                        </Row>
                    </form>
                </Card>
            </Container>
        </div>
    );
};

export default EditPark;