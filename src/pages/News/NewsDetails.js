import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from "react-router-dom"
import {
    Container,
    Card,
    CardBody,
    Col,
    Form,
    Input,
    Label,
    Row,
} from "reactstrap"

//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb"
import BASE_URL from "path";
import axios from "axios";

// import images
import img1 from "../../assets/images/small/img-2.jpg"
import avtar1 from "../../assets/images/users/avatar-2.jpg"

const NewsDetails = () => {
    const { id } = useParams();
    const [token, setToken] = useState(null);
    const [news, setNews] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Get token from localStorage
        const storedUser = localStorage.getItem("authUser");
        if (storedUser) {
            const { token } = JSON.parse(storedUser);
            setToken(token);
        }
    }, []);

    useEffect(() => {
        // Call API only when token and id are available
        if (token && id) {
            fetchNewsDetails(id);
        }
    }, [token, id]);

    const fetchNewsDetails = async (newsId) => {
        try {
            setLoading(true);
            const response = await axios.get(`${BASE_URL}/auth/getNewsById/${newsId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log(response);
            setNews(response.data.data || null);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch news details", err);
            setError("Failed to load news details");
            setLoading(false);
        }
    };
    const stripHtml = (html) => {
        const div = document.createElement("div");
        div.innerHTML = html;
        return div.textContent || div.innerText || "";
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    //meta title
    document.title = "News Details";
    return (
        <div className="page-content">
            <ul className="breadcrumb">
                <li>
                    <Link to="/"><a href="/">Home /</a></Link>
                </li>
                <li>
                    <Link to="/news-list"><a href="/">News List /</a></Link>
                </li>
                <li className="active">News Details</li>
            </ul>
            <Container>
                {/* Breadcrumb */}


                {/* Main Card */}
                <Card className="p-4 mb-4 shadow-sm">
                    <Row className="mb-4">
                        {/* Featured Image */}
                        <Col md={6} className="d-flex justify-content-center align-items-center text-center">
                            <img
                                src={news.featured_image || "default.jpg"}
                                alt={news.title}
                                className="img-fluid rounded"
                                style={{ maxHeight: "350px", objectFit: "cover" }}
                            />
                        </Col>

                        {/* News Info */}
                        <Col md={6}>
                            <Row className="align-items-center mb-3">
                                <Col md={6}>
                                    <div className="mb-4">
                                        <Link to="#" className="badge bg-light font-size-12">
                                            <i className="bx bx-purchase-tag-alt align-middle text-muted me-1"></i>
                                            News
                                        </Link>
                                    </div>
                                </Col>
                                <Col md={6} className="text-md-end">
                                    <Link to={`/edit-news/${news.id}`} className="btn btn-sm btn-success">
                                        Edit News
                                    </Link>
                                </Col>
                            </Row>

                            <div className="bg-light p-3">
                                <Row className="mb-3">
                                    <Col md={8}>
                                        <h4 className="mb-2">{news.title}</h4>
                                    </Col>
                                    <Col md={4} className="text-end">
                                        <h6 className="text-muted text-sm mb-2">Published Date</h6>
                                        <h5 className="font-size-15">
                                            {new Date(news.createdAt).toLocaleDateString("en-GB", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </h5>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={12}>
                                        <div dangerouslySetInnerHTML={{ __html: news.shortdescription }} />
                                    </Col>
                                </Row>

                                <hr style={{ border: "1px solid #c7c7c7" }} />

                                <div className="text-center">
                                    <Row className="mb-3">
                                        <Col sm={4}>
                                            <p className="text-muted mb-2">Category</p>
                                            <h5 className="font-size-15">{news.category?.name}</h5>
                                        </Col>
                                        <Col sm={4}>
                                            <p className="text-muted mb-2">Created Date</p>
                                            <h5 className="font-size-15">
                                                {new Date(news.createdAt).toLocaleDateString("en-GB", {
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "numeric",
                                                })}
                                            </h5>
                                        </Col>
                                        <Col sm={4}>
                                            <p className="text-muted mb-2">Posted By</p>
                                            <h5 className="font-size-15">{news.author?.name}</h5>
                                        </Col>
                                    </Row>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Card>

                {/* Description Section */}
                <Card className="p-4 mb-4 shadow-sm">
                    <h5 className="mb-3">Description</h5>
                    <Card className="p-3 mb-4 bg-light">
                        <div dangerouslySetInnerHTML={{ __html: news.description }} />
                    </Card>
                </Card>

                {/* Images Section */}
                {news.images && news.images.length > 0 && (
                    <Card className="p-4 mb-4 shadow-sm">
                        <h4 className="mb-3 mt-4">Images</h4>
                        <div
                            style={{
                                display: "flex",
                                overflowX: "auto",
                                gap: "16px",
                                paddingBottom: "10px"
                            }}
                        >
                            {news.images.map((image, index) => (
                                <div key={index} style={{ minWidth: "200px", flex: "0 0 auto" }}>
                                    <Card className="h-100">
                                        <img
                                            src={image}
                                            alt={`News ${index + 1}`}
                                            className="img-fluid rounded"
                                            style={{ height: "200px", width: "100%", objectFit: "contain" }}
                                        />
                                    </Card>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}
            </Container>
        </div>

    )
}

export default NewsDetails
