import React, { useState, useEffect } from "react";
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

const AddNews = () => {
  const [token, setToken] = useState(null);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [alertMsg, setAlertMsg] = useState({ type: "", message: "" });

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
  }, []);

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
          ? files
          : files[0]
        : value,
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title) newErrors.title = "Title is required";
    if (!formData.description) newErrors.description = "Description is required";
    if (!formData.shortdescription) newErrors.shortdescription = "Short description is required";
    if (!formData.featured_image) newErrors.featured_image = "Featured image is required";
    if (!formData.images || formData.images.length === 0) newErrors.images = "At least one image is required";
    if (!formData.category_id) newErrors.category_id = "Category is required";
    if (!formData.status) newErrors.status = "Status is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const today = new Date().toISOString().split("T")[0]; 
    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("shortdescription", formData.shortdescription);
    data.append("featured_image", formData.featured_image);

    // ✅ Append each image with the same key "images"
    for (let i = 0; i < formData.images.length; i++) {
      data.append("images", formData.images[i]);
    }

    data.append("category_id", formData.category_id);
    data.append("status", formData.status);
    data.append("published_at", today);

    try {
      const response = await axios.post(
        `${BASE_URL}/auth/addnews`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAlertMsg({ type: "success", message: " News added successfully!" });
    } catch (error) {
      console.error("API error:", error);
      setAlertMsg({ type: "danger", message: "Something Went Wrong !" });
      alert("Failed to submit news");
    }
  };

  return (
    <div className="page-content">
      <Container fluid>
        <form onSubmit={handleSubmit}>
          <Row>
            <Col>
              <Card>
                <CardBody>
                  <CardTitle className="h1 text-center">Add News</CardTitle>
                  {alertMsg.message && (
                    <Alert color={alertMsg.type}>{alertMsg.message}</Alert>
                  )}
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
                    />
                    {errors.shortdescription && <span className="text-danger">{errors.shortdescription}</span>}
                  </Col>

                  <Col lg={12} className="mt-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
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
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
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
                  </Col>

                  <Col lg={12} className="mt-3">
                    <label className="form-label">Images (multiple)</label>
                    <input
                      className="form-control"
                      type="file"
                      name="images"
                      onChange={handleChange}
                      multiple
                    />
                    {errors.images && <span className="text-danger">{errors.images}</span>}
                  </Col>

                  <Col lg={12} className="mt-4 text-center">
                    <Button type="submit" color="primary">Submit</Button>
                  </Col>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </form>
      </Container>
    </div>
  );
};

export default AddNews;
