import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    Card,
    CardBody,
    Col,
    Row,
    Button,
    Modal,
    ModalHeader,
    ModalBody,
    Container,
    Alert,
    Spinner,
    FormGroup,
    Label,
    Input
} from "reactstrap";
import axios from "axios";
import BASE_URL from "path"; // Replace with your actual BASE_URL import
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import "../../custom.css";

const PageList = () => {
    const [modal, setModal] = useState(false);
    const [token, setToken] = useState(null);
    const [categories, setCategories] = useState([]);
    const [pages, setPages] = useState([]);
    const [errors, setErrors] = useState({});
    const [alertMsg, setAlertMsg] = useState({ type: "", message: "" });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState({
        pages: false,
        categories: false,
        submit: false
    });

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        shortdescription: "",
        featured_image: null,
        images: [],
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
        { name: "", designation: "", image: null }
    ]);

    useEffect(() => {
        const storedUser = localStorage.getItem("authUser");
        if (storedUser) {
            const { token } = JSON.parse(storedUser);
            setToken(token);
        }
        fetchCategories();
    }, []);

    useEffect(() => {
        if (token) {
            fetchPages(currentPage);
        }
    }, [currentPage, token]);

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

    const fetchPages = async (page = 1) => {
        try {
            setLoading(prev => ({ ...prev, pages: true }));
            const response = await axios.get(`${BASE_URL}/auth/getallpages?status=all`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    limit: 15,
                    page: page
                },
            });
            console.log(response);
            setPages(response.data.data || []);
            setTotalPages(response.data.pagination.totalPages);
        } catch (err) {
            console.error("Failed to fetch pages", err);
        } finally {
            setLoading(prev => ({ ...prev, pages: false }));
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
            featured_image: null,
            images: [],
            category_id: "",
            name: "",
            designation: "",
            address: "",
            hours: "",
            contacts: "",
            status: "",
            published_at: ""
        });
        setCouncilMembers([{ name: "", designation: "", image: null }]);
        setModal(!modal);
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
        } else {
            updatedMembers[index][name] = value;
        }

        setCouncilMembers(updatedMembers);
    };

    const addCouncilMember = () => {
        setCouncilMembers([...councilMembers, { name: "", designation: "", image: null }]);
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
        if (!formData.featured_image) newErrors.featured_image = "featured_image is required";
        if (!formData.category_id) newErrors.category_id = "category_id is required";
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
            }
        });

        // Add other form data
        data.append("title", formData.title);
        data.append("description", formData.description);
        data.append("shortdescription", formData.shortdescription || "");
        data.append("featured_image", formData.featured_image);
        data.append("undeletable", formData.undeletable);

        for (let i = 0; i < formData.images.length; i++) {
            data.append("images", formData.images[i]);
        }

        data.append("category_id", formData.category_id);
        data.append("name", formData.name || "");
        data.append("designation", formData.designation || "");
        data.append("address", formData.address || "");
        data.append("hours", formData.hours || "");
        data.append("contacts", formData.contacts || "");
        data.append("status", formData.status);
        data.append("published_at", dateTimeString);

        try {
            const response = await axios.post(
                `${BASE_URL}/auth/addpages`,
                data,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setAlertMsg({ type: "success", message: "Page added successfully!" });
            fetchPages(currentPage);
            setTimeout(() => {
                setModal(false);
                setAlertMsg({ type: "", message: "" });
            }, 2000);
        } catch (error) {
            console.error("API error:", error);
            setAlertMsg({ type: "danger", message: "Something Went Wrong!" });
        } finally {
            setLoading(prev => ({ ...prev, submit: false }));
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this page?")) {
            try {
                setLoading(prev => ({ ...prev, pages: true }));
                const response = await axios.post(
                    `${BASE_URL}/auth/deletePages`,
                    { id: id },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json"
                        }
                    }
                );
                fetchPages(currentPage);
            } catch (error) {
                console.error("Error deleting page:", error);
            } finally {
                setLoading(prev => ({ ...prev, pages: false }));
            }
        }
    };

    const renderCouncilMembersPreview = (membersJson) => {
        if (!membersJson) return null;

        try {
            const members = JSON.parse(membersJson);
            return (
                <Row className="mt-3">
                    {members.map((member, index) => (
                        <Col md={4} key={index} className="mb-3">
                            <Card>
                                {member.image && (
                                    <img
                                        src={`${BASE_URL}/uploads/${member.image}`}
                                        alt={member.name}
                                        className="card-img-top"
                                        style={{ height: "150px", objectFit: "cover" }}
                                    />
                                )}
                                <CardBody>
                                    <h5>{member.name}</h5>
                                    <p className="text-muted">{member.designation}</p>
                                </CardBody>
                            </Card>
                        </Col>
                    ))}
                </Row>
            );
        } catch (e) {
            console.error("Error parsing council members", e);
            return null;
        }
    };

    return (
        <div className="page-content">
            <Container fluid>
                <Row className="mb-3">
                    <Col>
                        <h4 className="mb-0">Page List</h4>
                    </Col>
                    <Col className="text-end">
                        <Button color="primary" onClick={toggleModal}>
                            <i className="mdi mdi-plus me-1"></i> Add Page
                        </Button>
                    </Col>
                </Row>

                {loading.pages ? (
                    <div className="text-center my-5">
                        <Spinner color="primary" />
                        <p>Loading pages...</p>
                    </div>
                ) : (
                    <Row className="justify-content-center">
                        <Col xl={12}>
                            <div>
                                <Row>
                                    {pages.map((item, index) => (
                                        <Col key={index} sm={4} md={4} lg={4}>
                                            <Card className="p-1 border shadow-none">
                                                <div className="p-3">
                                                    <div className="d-flex justify-content-between">
                                                        <div>
                                                            <h5>
                                                                <Link to={`/page-details/${item.id}`} className="text-dark">
                                                                    {item.title.length > 60
                                                                        ? item.title.substring(0, 60) + "..."
                                                                        : item.title}
                                                                </Link>
                                                            </h5>
                                                        </div>
                                                        <div>
                                                            <Link to={`/edit-page/${item.id}`}>
                                                                <i
                                                                    className="bx bx-edit align-middle fw-20 text-primary me-2"
                                                                    title="Edit"
                                                                    style={{ cursor: "pointer" }}
                                                                ></i>
                                                            </Link>
                                                        </div>
                                                    </div>

                                                    <p className="text-muted mb-0">
                                                        {new Date(item.createdAt).toLocaleDateString("en-GB", {
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
                                                                {item.author?.name || "Admin"}
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
                                                            <div>
                                                                <Link to={`/page-details/${item.id}`} className="text-primary">
                                                                    Read more <i className="mdi mdi-arrow-right"></i>
                                                                </Link>
                                                            </div>
                                                        </Col>

                                                        {!item.undeletable && (
                                                            <Col sm={2} md={2} lg={2} className="text-end fs-4">
                                                                <i className="bx bx-trash align-middle text-danger me-2"
                                                                    title="Delete"
                                                                    style={{ cursor: 'pointer' }}
                                                                    onClick={() => handleDelete(item.id)}
                                                                ></i>
                                                            </Col>
                                                        )}
                                                    </Row>
                                                </div>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                                {/* Pagination */}
                                <div className="text- mt-4">
                                    <ul className="pagination justify-content-end">
                                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                            <button
                                                className="page-link"
                                                onClick={() => setCurrentPage(prev => prev - 1)}
                                                disabled={currentPage === 1}
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
                                                    onClick={() => setCurrentPage(index + 1)}
                                                >
                                                    {index + 1}
                                                </button>
                                            </li>
                                        ))}
                                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                            <button
                                                className="page-link"
                                                onClick={() => setCurrentPage(prev => prev + 1)}
                                                disabled={currentPage === totalPages}
                                            >
                                                &raquo;
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </Col>
                    </Row>
                )}

                {/* Add Page Modal */}
                <Modal isOpen={modal} toggle={toggleModal} size="lg">
                    <ModalHeader toggle={toggleModal}>Add New Page</ModalHeader>
                    <ModalBody>
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
                                            <Col md={1} className="d-flex align-items-center" style={{ marginTop: "10px" }}>
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
                                {errors.contacts && (
                                    <div className="invalid-feedback d-block">{errors.contacts}</div>
                                )}
                            </FormGroup>

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
                                {errors.address && (
                                    <div className="invalid-feedback d-block">{errors.address}</div>
                                )}
                            </FormGroup>

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
                                {errors.hours && (
                                    <div className="invalid-feedback d-block">{errors.hours}</div>
                                )}
                            </FormGroup>
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
                                            invalid={!!errors.featured_image}
                                        />
                                        {errors.featured_image && (
                                            <div className="invalid-feedback d-block">{errors.featured_image}</div>
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
                                    </FormGroup>
                                </Col>
                            </Row>
                            <div className="form-check">
                                <Input
                                    type="checkbox"
                                    className="form-check-Input"
                                    id="formrow-customCheck"
                                    name="undeletable"
                                    checked={formData.undeletable === 1}
                                    onChange={(e) =>
                                        setFormData({ ...formData, undeletable: e.target.checked ? 1 : 0 })
                                    }
                                />
                                <Label
                                    className="form-check-Label"
                                    htmlFor="formrow-customCheck"
                                >
                                   Deletion of this page is not permitted.
                                </Label>
                            </div>

                            <div className="text-center mt-4">
                                <Button
                                    color="primary"
                                    type="submit"
                                    disabled={loading.submit}
                                    className="px-4"
                                >
                                    {loading.submit ? (
                                        <>
                                            <Spinner size="sm" className="me-2" /> Submitting...
                                        </>
                                    ) : (
                                        "Submit"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </ModalBody>
                </Modal>
            </Container>
        </div>
    );
};

export default PageList;