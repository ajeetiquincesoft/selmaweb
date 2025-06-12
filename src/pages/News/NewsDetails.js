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
        <>
            <div className="page-content">
                <Container fluid>
                    <ul className="breadcrumb">
                        <li>
                            <Link to="/"><a href="/">Home /</a></Link>
                        </li>
                        <li>
                            <Link to="/news-list"><a href="/">News List /</a></Link>
                        </li>
                        <li className="active">News Details</li>
                    </ul>
                    <Row>
                        <Col lg={12}>
                            <Card>
                                <CardBody>
                                    <div className="pt-3">
                                        <Row className="justify-content-center">
                                            <Col xl={8}>
                                                <div>
                                                    <div className='text-end'>
                                                        <Link to={`/edit-news/${news.id}`}>
                                                            <button className='btn btn-success'>Edit</button>
                                                        </Link>
                                                    </div>

                                                    <div className="text-center">
                                                        <div className="mb-4">
                                                            <Link
                                                                to="#"
                                                                className="badge bg-light font-size-12"
                                                            >
                                                                <i className="bx bx-purchase-tag-alt align-middle text-muted me-1"></i>
                                                                News
                                                            </Link>
                                                        </div>

                                                        <h4>{news.title}</h4>
                                                        <p className="text-muted mb-4">
                                                            <div dangerouslySetInnerHTML={{ __html: news.shortdescription }} />
                                                        </p>
                                                    </div>

                                                    <hr />
                                                    <div className="text-center">
                                                        <Row>
                                                            <Col sm={4}>
                                                                <div>
                                                                    <p className="text-muted mb-2">Categories</p>
                                                                    <h5 className="font-size-15">{news.category?.name}</h5>
                                                                </div>
                                                            </Col>
                                                            <Col sm={4}>
                                                                <div className="mt-4 mt-sm-0">
                                                                    <p className="text-muted mb-2">Date</p>
                                                                    <h5 className="font-size-15">

                                                                        {new Date(news.createdAt).toLocaleDateString("en-GB", {
                                                                            day: "2-digit",
                                                                            month: "short",
                                                                            year: "numeric",
                                                                        })}
                                                                    </h5>
                                                                </div>
                                                            </Col>
                                                            <Col sm={4}>
                                                                <div className="mt-4 mt-sm-0">
                                                                    <p className="text-muted mb-2">Post by</p>
                                                                    <h5 className="font-size-15">{news.author?.name}</h5>
                                                                </div>
                                                            </Col>
                                                        </Row>
                                                    </div>
                                                    <hr />

                                                    <div className="my-5">
                                                        <img
                                                            src={news.featured_image}
                                                            alt=""
                                                            className="img-thumbnail mx-auto d-block"
                                                        />
                                                    </div>
                                                    <div style={{ overflowX: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>
                                                        {news.images && news.images.map((item, index) => (
                                                            <img
                                                                key={index}
                                                                src={item}
                                                                alt={`news-img-${index}`}
                                                                style={{
                                                                    width: '120px',
                                                                    height: '80px',
                                                                    objectFit: 'cover',
                                                                    display: 'inline-block',
                                                                    marginRight: '10px',
                                                                    borderRadius: '6px',
                                                                }}
                                                                className="img-thumbnail"
                                                            />
                                                        ))}
                                                    </div>

                                                    <hr />

                                                    <div className="mt-4">
                                                        <div className="">

                                                            <div dangerouslySetInnerHTML={{ __html: news.description }} />
                                                        </div>
                                                    </div>

                                                </div>
                                            </Col>
                                        </Row>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        </>
    )
}

export default NewsDetails
