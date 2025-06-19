import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Card,
    CardBody,
    Col,
    Row,
    Button,
    Alert,
    Spinner,
    FormGroup,
    Label,
    Input,
    Container
} from "reactstrap";
import axios from "axios";
import BASE_URL from "path"; // Replace with your actual BASE_URL import
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import "../../custom.css";

const EditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [token, setToken] = useState(null);
    const [categories, setCategories] = useState([]);
    const [errors, setErrors] = useState({});
    const [alertMsg, setAlertMsg] = useState({ type: "", message: "" });
    const [loading, setLoading] = useState({
        page: true,
        categories: false,
        submit: false
    });

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        shortdescription: "",
        featured_image: null,
        existing_featured_image: "",
        images: [],
        existing_images: [],
        category_id: "",
        name: "",
        designation: "",
        address: "",
        hours: "",
        contacts: "",
        status: "",
        published_at: ""
    });

    const [councilMembers, setCouncilMembers] = useState([
        { name: "", designation: "", image: null, existing_image: "" }
    ]);

    useEffect(() => {
        const storedUser = localStorage.getItem("authUser");
        if (storedUser) {
            const { token } = JSON.parse(storedUser);
            setToken(token);
        }
        fetchCategories();
        fetchPageData();
    }, [token, id]);

    const fetchCategories = async () => {
        try {
            setLoading(prev => ({ ...prev, categories: true }));
            const response = await axios.get(`${BASE_URL}/auth/getallpagescategory`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setCategories(response.data.data || []);
        } catch (err) {
            console.error("Failed to fetch categories", err);
        } finally {
            setLoading(prev => ({ ...prev, categories: false }));
        }
    };

    const fetchPageData = async () => {
        try {
            setLoading(prev => ({ ...prev, page: true }));
            const response = await axios.get(`${BASE_URL}/auth/getPageById/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const pageData = response.data.data;

            // Set main form data
            setFormData({
                title: pageData.title || "",
                description: pageData.description || "",
                shortdescription: pageData.shortdescription || "",
                featured_image: null,
                existing_featured_image: pageData.featured_image || "",
                images: [],
                existing_images: pageData.images || [],
                category_id: pageData.category_id || "",
                name: pageData.name || "",
                designation: pageData.designation || "",
                address: pageData.address || "",
                hours: pageData.hours || "",
                contacts: pageData.contacts || "",
                status: pageData.status?.toString() || "",
                published_at: pageData.published_at || ""
            });

            // Handle council members data
            if (pageData.counsil_members && pageData.counsil_members.length > 0) {
                setCouncilMembers(pageData.counsil_members.map(member => ({
                    name: member.name || "",
                    designation: member.designation || member.designation || "", // Note the typo in your data (designation vs designation)
                    image: null,
                    existing_image: member.image || ""
                })));
            } else {
                setCouncilMembers([{ name: "", designation: "", image: null, existing_image: "" }]);
            }

        } catch (err) {
            console.error("Failed to fetch page data", err);
            setAlertMsg({ type: "danger", message: "Failed to load page data" });
        } finally {
            setLoading(prev => ({ ...prev, page: false }));
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

    const handleCouncilMemberChange = (index, e) => {
        const { name, value, files } = e.target;
        const updatedMembers = [...councilMembers];

        if (name === "image") {
            updatedMembers[index][name] = files[0];
            // Clear existing image when new image is selected
            updatedMembers[index].existing_image = "";
        } else {
            updatedMembers[index][name] = value;
        }

        setCouncilMembers(updatedMembers);
    };

    const addCouncilMember = () => {
        setCouncilMembers([...councilMembers, { name: "", designation: "", image: null, existing_image: "" }]);
    };

    const removeCouncilMember = (index) => {
        const updatedMembers = [...councilMembers];
        updatedMembers.splice(index, 1);
        setCouncilMembers(updatedMembers);
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

        setLoading(prev => ({ ...prev, submit: true }));
        const now = new Date();
        const dateTimeString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
            now.getDate()
        ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(
            now.getMinutes()
        ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

        const data = new FormData();

        // Add council members in the required format
        councilMembers.forEach((member, index) => {
            data.append(`council_name_${index}`, member.name);
            data.append(`council_designation_${index}`, member.designation);

            if (member.image) {
                data.append(`council_image_${index}`, member.image);
            } else if (member.existing_image) {
                data.append(`council_existing_image_${index}`, member.existing_image);
            }
        });

        // Add other form data
        data.append("title", formData.title);
        data.append("description", formData.description);
        data.append("shortdescription", formData.shortdescription || "");

        if (formData.featured_image) {
            data.append("featured_image", formData.featured_image);
        } else {
            data.append("existing_featured_image", formData.existing_featured_image);
        }

        // Add new images
        for (let i = 0; i < formData.images.length; i++) {
            data.append("images", formData.images[i]);
        }

        // Add existing images
        formData.existing_images.forEach((img, index) => {
            data.append(`existing_images[${index}]`, img);
        });

        data.append("category_id", formData.category_id);
        data.append("name", formData.name || "");
        data.append("designation", formData.designation || "");
        data.append("address", formData.address || "");
        data.append("hours", formData.hours || "");
        data.append("contacts", formData.contacts || "");
        data.append("status", formData.status);
        data.append("published_at", dateTimeString);
        data.append("id", id);

        try {
            const response = await axios.post(
                `${BASE_URL}/auth/updatepages`,
                data,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setAlertMsg({ type: "success", message: "Page updated successfully!" });
            setTimeout(() => {
                navigate("/page-list");
            }, 1500);
        } catch (error) {
            console.error("API error:", error);
            setAlertMsg({ type: "danger", message: "Something Went Wrong!" });
        } finally {
            setLoading(prev => ({ ...prev, submit: false }));
        }
    };

    const removeExistingImage = (index) => {
        const updatedImages = [...formData.existing_images];
        updatedImages.splice(index, 1);
        setFormData(prev => ({ ...prev, existing_images: updatedImages }));
    };

    return (
        <div className="page-content">
            <Container fluid>
                <Row className="mb-3">
                    <Col>
                        <h4 className="mb-0">Edit Page</h4>
                    </Col>
                    <Col className="text-end">
                        <Button color="secondary" onClick={() => navigate("/page-list")}>
                            Back to List
                        </Button>
                    </Col>
                </Row>

                {loading.page ? (
                    <div className="text-center my-5">
                        <Spinner color="primary" />
                        <p>Loading page data...</p>
                    </div>
                ) : (
                    <Row className="justify-content-center">
                        <Col xl={12}>
                            <Card>
                                <CardBody>
                                    {alertMsg.message && (
                                        <Alert color={alertMsg.type}>{alertMsg.message}</Alert>
                                    )}
                                    <form onSubmit={handleSubmit}>
                                        <FormGroup>
                                            <Label>Title</Label>
                                            <Input
                                                type="text"
                                                name="title"
                                                value={formData.title}
                                                onChange={handleChange}
                                                invalid={!!errors.title}
                                            />
                                            {errors.title && <div className="invalid-feedback d-block">{errors.title}</div>}
                                        </FormGroup>

                                        <FormGroup>
                                            <Label>Short Description</Label>
                                            <Input
                                                type="textarea"
                                                name="shortdescription"
                                                value={formData.shortdescription}
                                                onChange={handleChange}
                                                rows={3}
                                                invalid={!!errors.shortdescription}
                                            />
                                            {errors.shortdescription && (
                                                <div className="invalid-feedback d-block">{errors.shortdescription}</div>
                                            )}
                                        </FormGroup>

                                        <FormGroup>
                                            <Label>Description</Label>
                                            <CKEditor
                                                editor={ClassicEditor}
                                                data={formData.description}
                                                onChange={(event, editor) => {
                                                    const content = editor.getData();
                                                    setFormData({ ...formData, description: content });
                                                }}
                                            />
                                            {errors.description && (
                                                <div className="invalid-feedback d-block">{errors.description}</div>
                                            )}
                                        </FormGroup>

                                        <Row>
                                            <Col md={6}>
                                                <FormGroup>
                                                    <Label>Name</Label>
                                                    <Input
                                                        type="text"
                                                        name="name"
                                                        value={formData.name}
                                                        onChange={handleChange}
                                                    />
                                                </FormGroup>
                                            </Col>
                                            <Col md={6}>
                                                <FormGroup>
                                                    <Label>Designation</Label>
                                                    <Input
                                                        type="text"
                                                        name="designation"
                                                        value={formData.designation}
                                                        onChange={handleChange}
                                                    />
                                                </FormGroup>
                                            </Col>
                                        </Row>

                                        <FormGroup>
                                            <Label>Council Members</Label>
                                            {councilMembers.map((member, index) => (
                                                <div key={index} className="mb-3 p-3 border rounded">
                                                    <Row>
                                                        <Col md={4}>
                                                            <FormGroup>
                                                                <Label>Name</Label>
                                                                <Input
                                                                    type="text"
                                                                    name="name"
                                                                    value={member.name}
                                                                    onChange={(e) => handleCouncilMemberChange(index, e)}
                                                                    invalid={!!errors[`council_name_${index}`]}
                                                                />
                                                                {errors[`council_name_${index}`] && (
                                                                    <div className="invalid-feedback d-block">
                                                                        {errors[`council_name_${index}`]}
                                                                    </div>
                                                                )}
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md={4}>
                                                            <FormGroup>
                                                                <Label>Designation</Label>
                                                                <Input
                                                                    type="text"
                                                                    name="designation"
                                                                    value={member.designation}
                                                                    onChange={(e) => handleCouncilMemberChange(index, e)}
                                                                    invalid={!!errors[`council_designation_${index}`]}
                                                                />
                                                                {errors[`council_designation_${index}`] && (
                                                                    <div className="invalid-feedback d-block">
                                                                        {errors[`council_designation_${index}`]}
                                                                    </div>
                                                                )}
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md={3}>
                                                            <FormGroup>
                                                                <Label>Image</Label>
                                                                <Input
                                                                    type="file"
                                                                    name="image"
                                                                    onChange={(e) => handleCouncilMemberChange(index, e)}
                                                                />
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md={1} className="d-flex align-items-end">
                                                            <Button
                                                                color="danger"
                                                                size="sm"
                                                                onClick={() => removeCouncilMember(index)}
                                                                disabled={councilMembers.length <= 1}
                                                            >
                                                                <i className="bx bx-trash"></i>
                                                            </Button>
                                                        </Col>
                                                    </Row>
                                                </div>
                                            ))}
                                            <Button color="primary" size="sm" onClick={addCouncilMember}>
                                                <i className="bx bx-plus"></i> Add Member
                                            </Button>
                                        </FormGroup>
                                        <div>
                                            <FormGroup>
                                                <Label>Address</Label>
                                                <CKEditor
                                                    editor={ClassicEditor}
                                                    data={formData.address}
                                                    onChange={(event, editor) => {
                                                        const content = editor.getData();
                                                        setFormData({ ...formData, address: content });
                                                    }}
                                                />
                                                {errors?.address && (
                                                    <div className="invalid-feedback d-block">{errors.address}</div>
                                                )}
                                            </FormGroup>
                                        </div>
                                        <div>
                                            <FormGroup>
                                                <Label>Contacts</Label>
                                                <CKEditor
                                                    editor={ClassicEditor}
                                                    data={formData.contacts}
                                                    onChange={(event, editor) => {
                                                        const content = editor.getData();
                                                        setFormData({ ...formData, contacts: content });
                                                    }}
                                                />
                                                {errors?.contacts && (
                                                    <div className="invalid-feedback d-block">{errors.contacts}</div>
                                                )}
                                            </FormGroup>
                                        </div>

                                        <div>
                                            <FormGroup>
                                                <Label>Hours</Label>
                                                <CKEditor
                                                    editor={ClassicEditor}
                                                    data={formData.hours}
                                                    onChange={(event, editor) => {
                                                        const content = editor.getData();
                                                        setFormData({ ...formData, hours: content });
                                                    }}
                                                />
                                                {errors?.hours && (
                                                    <div className="invalid-feedback d-block">{errors.hours}</div>
                                                )}
                                            </FormGroup>
                                        </div>




                                        <Row>
                                            <Col md={6}>
                                                <FormGroup>
                                                    <Label>Category</Label>
                                                    <Input
                                                        type="select"
                                                        name="category_id"
                                                        value={formData.category_id}
                                                        onChange={handleChange}
                                                        invalid={!!errors.category_id}
                                                    >
                                                        <option value="">Select Category</option>
                                                        {categories.map(category => (
                                                            <option key={category.id} value={category.id}>
                                                                {category.name}
                                                            </option>
                                                        ))}
                                                    </Input>
                                                    {errors.category_id && (
                                                        <div className="invalid-feedback d-block">{errors.category_id}</div>
                                                    )}
                                                </FormGroup>
                                            </Col>
                                            <Col md={6}>
                                                <FormGroup>
                                                    <Label>Status</Label>
                                                    <Input
                                                        type="select"
                                                        name="status"
                                                        value={formData.status}
                                                        onChange={handleChange}
                                                        invalid={!!errors.status}
                                                    >
                                                        <option value="">Select Status</option>
                                                        <option value="0">Unpublished</option>
                                                        <option value="2">Draft</option>
                                                        <option value="1">Published</option>
                                                    </Input>
                                                    {errors.status && (
                                                        <div className="invalid-feedback d-block">{errors.status}</div>
                                                    )}
                                                </FormGroup>
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md={6}>
                                                <FormGroup>
                                                    <Label>Featured Image</Label>
                                                    <Input
                                                        type="file"
                                                        name="featured_image"
                                                        onChange={handleChange}
                                                    />
                                                    {formData.existing_featured_image && (
                                                        <div className="mt-2">
                                                            <small>Current Image:</small>
                                                            <img
                                                                src={`${BASE_URL}/uploads/${formData.existing_featured_image}`}
                                                                alt="Featured"
                                                                className="img-thumbnail mt-1"
                                                                style={{ maxHeight: "100px" }}
                                                            />
                                                        </div>
                                                    )}
                                                </FormGroup>
                                            </Col>
                                            <Col md={6}>
                                                <FormGroup>
                                                    <Label>Additional Images</Label>
                                                    <Input
                                                        type="file"
                                                        name="images"
                                                        onChange={handleChange}
                                                        multiple
                                                    />
                                                    {formData.existing_images.length > 0 && (
                                                        <div className="mt-2">
                                                            <small>Current Images:</small>
                                                            <div className="d-flex flex-wrap gap-2 mt-1">
                                                                {formData.existing_images.map((img, index) => (
                                                                    <div key={index} className="position-relative">
                                                                        <img
                                                                            src={`${BASE_URL}/uploads/${img}`}
                                                                            alt={`Gallery ${index}`}
                                                                            className="img-thumbnail"
                                                                            style={{ height: "50px" }}
                                                                        />
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-danger btn-xs position-absolute top-0 end-0"
                                                                            onClick={() => removeExistingImage(index)}
                                                                        >
                                                                            <i className="bx bx-x"></i>
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </FormGroup>
                                            </Col>
                                        </Row>

                                        <div className="text-center mt-4">
                                            <Button
                                                color="primary"
                                                type="submit"
                                                disabled={loading.submit}
                                                className="px-4"
                                            >
                                                {loading.submit ? (
                                                    <>
                                                        <Spinner size="sm" className="me-2" /> Updating...
                                                    </>
                                                ) : (
                                                    "Update Page"
                                                )}
                                            </Button>
                                        </div>
                                        {alertMsg.message && (
                                            <Alert color={alertMsg.type}>{alertMsg.message}</Alert>
                                        )}
                                    </form>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                )}
            </Container>
        </div>
    );
};

export default EditPage;