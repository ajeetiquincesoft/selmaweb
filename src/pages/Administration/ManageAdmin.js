import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
    Card,
    Col,
    Container,
    Row,
    Button,
    Alert,
    Modal,
    ModalHeader,
    ModalBody,
    Table,
    Spinner
} from "reactstrap";
import BASE_URL from "path"; // Replace with your actual BASE_URL

const UserManagement = () => {
    const [token, setToken] = useState(null);
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [alertMsg, setAlertMsg] = useState({ type: "", message: "" });
    const [loading, setLoading] = useState({
        initial: true,
        users: false,
        submit: false,
        delete: false,
    });

    const toggleModal = () => setModalOpen(!modalOpen);

    const [formData, setFormData] = useState({
        name: "",
        role: "",
        email: "",
        phone: "",
        password: "",
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        const storedUser = localStorage.getItem("authUser");
        if (storedUser) {
            const { token } = JSON.parse(storedUser);
            setToken(token);
        }
    }, []);

    useEffect(() => {
        if (token) {
            fetchUsers();
            fetchRoles();
        }
    }, [token]);

    const fetchUsers = async () => {
        try {
            setLoading(prev => ({ ...prev, users: true }));
            const res = await axios.get(`${BASE_URL}/auth/getallusers`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsers(res.data?.data || []);
        } catch (err) {
            console.error("Error fetching users", err);
        } finally {
            setLoading(prev => ({ ...prev, users: false, initial: false }));
        }
    };

    const fetchRoles = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/auth/getallroles`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setRoles(res.data?.data || []);
        } catch (err) {
            console.error("Error fetching roles", err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const resetForm = () => {
        setFormData({
            name: "",
            role: "",
            email: "",
            phone: "",
            password: "",
        });
        setErrors({});
        setEditMode(false);
        setCurrentId(null);
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = "Name is required";
        if (!formData.role) newErrors.role = "Role is required";
        if (!formData.email) newErrors.email = "Email is required";
        if (!formData.phone) newErrors.phone = "Phone is required";
        if (!editMode && !formData.password) newErrors.password = "Password is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            setLoading(prev => ({ ...prev, submit: true }));

            const payload = { ...formData, id: currentId };

            if (editMode) {
                await axios.post(`${BASE_URL}/auth/updateUser`, payload, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setAlertMsg({ type: "success", message: "User updated successfully!" });
            } else {
                await axios.post(`${BASE_URL}/auth/insertuser`, payload, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setAlertMsg({ type: "success", message: "User created successfully!" });
            }

            toggleModal();
            resetForm();
            fetchUsers();
        } catch (err) {
            setAlertMsg({
                type: "danger",
                message: "Failed to save user: " + (err.response?.data?.message || err.message),
            });
        } finally {
            setLoading(prev => ({ ...prev, submit: false }));
        }
    };

    const handleEdit = (user) => {
        setFormData({
            name: user.name,
            role: user.role,
            email: user.email,
            phone: user.phone,
            password: "",
        });
        setCurrentId(user.id);
        setEditMode(true);
        setModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            setLoading(prev => ({ ...prev, delete: id }));
            await axios.post(`${BASE_URL}/auth/deleteuser`, { id }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setAlertMsg({ type: "success", message: "User deleted successfully!" });
            fetchUsers();
        } catch (err) {
            setAlertMsg({ type: "danger", message: "Failed to delete user!" });
        } finally {
            setLoading(prev => ({ ...prev, delete: false }));
        }
    };

    document.title = "User Management | Admin";

    if (loading.initial) {
        return (
            <div className="page-content">
                <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                    <Spinner color="primary" />
                </div>
            </div>
        );
    }

    return (
        <div className="page-content">
            <Container fluid>
                <Row className="mb-3">
                    <Col className="d-flex justify-content-between align-items-center">
                        <ul className="breadcrumb">
                            <li><Link to="/">Home /</Link></li>
                            <li className="active">Users</li>
                        </ul>
                        <Button color="primary" onClick={() => { resetForm(); toggleModal(); }}>
                            Add User
                        </Button>
                    </Col>
                </Row>

                {alertMsg.message && <Alert color={alertMsg.type}>{alertMsg.message}</Alert>}

                <Row>
                    <Col>
                        {loading.users ? (
                            <div className="text-center my-5">
                                <Spinner color="primary" />
                            </div>
                        ) : (
                            <Table responsive className="align-middle table-nowrap mb-0 table table-hover">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Name</th>
                                        <th>Role</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.length > 0 ? (
                                        users.map((user, index) => (
                                            <tr key={user.id}>
                                                <td>{index + 1}</td>
                                                <td>{user.name}</td>
                                                <td>{user.role}</td>
                                                <td>{user.email}</td>
                                                <td>{user.phone}</td>
                                                <td>
                                                    <Button size="sm" color="warning" className="me-2" onClick={() => handleEdit(user)}>
                                                        Edit
                                                    </Button>
                                                    {loading.delete === user.id ? (
                                                        <Spinner size="sm" color="danger" />
                                                    ) : (
                                                        <Button size="sm" color="danger" onClick={() => handleDelete(user.id)}>
                                                            Delete
                                                        </Button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="6" className="text-center">No users found.</td></tr>
                                    )}
                                </tbody>
                            </Table>
                        )}
                    </Col>
                </Row>

                <Modal isOpen={modalOpen} toggle={toggleModal}>
                    <ModalHeader toggle={toggleModal}>{editMode ? "Edit User" : "Add User"}</ModalHeader>
                    <ModalBody>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label>Name</label>
                                <input
                                    className="form-control"
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                                {errors.name && <small className="text-danger">{errors.name}</small>}
                            </div>

                            <div className="mb-3">
                                <label>Role</label>
                                <select
                                    className="form-select"
                                    name="role"  // ✅ Corrected from role_id
                                    value={formData.role}
                                    onChange={handleChange}
                                >
                                    <option value="">-- Select Role --</option>
                                    {roles.map(role => (
                                        <option key={role.role} value={role.role}>{role.role}</option>
                                    ))}
                                </select>
                                {errors.role && <small className="text-danger">{errors.role}</small>}
                            </div>

                            <div className="mb-3">
                                <label>Email</label>
                                <input
                                    className="form-control"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                                {errors.email && <small className="text-danger">{errors.email}</small>}
                            </div>

                            <div className="mb-3">
                                <label>Phone</label>
                                <input
                                    className="form-control"
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                                {errors.phone && <small className="text-danger">{errors.phone}</small>}
                            </div>

                            {!editMode && (
                                <div className="mb-3">
                                    <label>Password</label>
                                    <input
                                        className="form-control"
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                    {errors.password && <small className="text-danger">{errors.password}</small>}
                                </div>
                            )}

                           

                            <div className="text-end">
                                <Button type="submit" color="primary" disabled={loading.submit}>
                                    {loading.submit ? (
                                        <>
                                            <Spinner size="sm" className="me-2" />
                                            {editMode ? "Updating..." : "Submitting..."}
                                        </>
                                    ) : editMode ? "Update" : "Submit"}
                                </Button>
                            </div>
                        </form>
                    </ModalBody>
                </Modal>
            </Container>
        </div>
    );
};

export default UserManagement;
