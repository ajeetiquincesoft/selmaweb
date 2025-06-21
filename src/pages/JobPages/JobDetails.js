import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from "react-router-dom";
import {
    Container,
    Card,
    CardBody,
    Col,
    Row,
} from "reactstrap";

import Breadcrumbs from "../../components/Common/Breadcrumb";
import BASE_URL from "path";
import axios from "axios";

const JobDetails = () => {
    const { id } = useParams();
    const [token, setToken] = useState(null);
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("authUser");
        if (storedUser) {
            const { token } = JSON.parse(storedUser);
            setToken(token);
        }
    }, []);

    useEffect(() => {
        if (token && id) {
            fetchJobDetails(id);
        }
    }, [token, id]);

    const fetchJobDetails = async (jobId) => {
        try {
            setLoading(true);
            const response = await axios.get(`${BASE_URL}/auth/getjobById/${jobId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setJob(response.data.data || null);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch job details", err);
            setError("Failed to load job details");
            setLoading(false);
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    document.title = "Job Details | City of Selma";
    return (
        <div className="page-content">
            <ul className="breadcrumb">
                <li>
                    <Link to="/"><a href="/">Home /</a></Link>
                </li>
                <li>
                    <Link to="/job-list"><a href="/">Jobs List /</a></Link>
                </li>
                <li className="active">Job Details</li>
            </ul>
            <Container>
                {/* Breadcrumb */}


                {/* Main Job Card */}
                <Card className="p-4 mb-4 shadow-sm">
                    <Row className="mb-4">
                        {/* Left Column: Featured Image */}
                        <Col md={6} className="d-flex justify-content-center align-items-center text-center">
                            <img
                                src={job.featured_image || "default.jpg"}
                                alt={job.title}
                                className="img-fluid rounded"
                                style={{ maxHeight: "350px", objectFit: "cover" }}
                            />
                        </Col>

                        {/* Right Column: Job Info */}
                        <Col md={6}>
                            <Row className="align-items-center mb-3">
                                <Col md={6}>
                                    <div >
                                        <Link to="#" className="badge bg-light font-size-12">
                                            <i className="bx bx-purchase-tag-alt align-middle text-muted me-1"></i>
                                            Job
                                        </Link>
                                    </div>
                                </Col>
                                <Col md={6} className="text-md-end">
                                    <Link to={`/edit-job/${job.id}`} className="btn btn-sm btn-success">
                                        Edit Job
                                    </Link>
                                </Col>
                            </Row>

                            <div className="bg-light p-3">
                                {/* Title and Date */}
                                <Row className="mb-3">
                                    <Col md={8}>
                                        <h4 className="mb-2">{job.title}</h4>
                                    </Col>
                                    <Col md={4} className="text-end">
                                        <h6 className="text-muted text-sm mb-2">Published Date</h6>
                                        <h5 className="font-size-15">
                                            {new Date(job.createdAt).toLocaleDateString("en-GB", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </h5>
                                    </Col>
                                </Row>

                                {/* Short Description */}
                                <Row>
                                    <Col md={12}>
                                        <div dangerouslySetInnerHTML={{ __html: job.shortdescription }} />
                                    </Col>
                                </Row>

                                <hr style={{ border: "1px solid #c7c7c7" }} />

                                {/* Category, Date, Poster */}
                                <div className="text-center">
                                    <Row className="mb-3">
                                        <Col sm={4}>
                                            <p className="text-muted mb-2">Category</p>
                                            <h5 className="font-size-15">{job.category?.name}</h5>
                                        </Col>
                                        <Col sm={4}>
                                            <p className="text-muted mb-2">Created Date</p>
                                            <h5 className="font-size-15">
                                                {new Date(job.createdAt).toLocaleDateString("en-GB", {
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "numeric",
                                                })}
                                            </h5>
                                        </Col>
                                        <Col sm={4}>
                                            <p className="text-muted mb-2">Posted By</p>
                                            <h5 className="font-size-15">{job.user?.name}</h5>
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
                        <div dangerouslySetInnerHTML={{ __html: job.description }} />
                    </Card>
                </Card>

                {/* Job Link Section */}
                <Card className="p-2 mb-4 shadow-sm">
                    <Row>

                        <Col sm={6} className='text-center'>
                            <div className='bg-light p-4'>
                                <p className="text-muted mb-2">Job Link</p>
                                <h5 className="font-size-15">{job.link}</h5>
                            </div>

                        </Col>
                        <Col sm={6} className='text-center'>
                            <div className='bg-light p-4'>
                                <p className="text-muted mb-2">Job Apply Link</p>
                                <h5 className="font-size-15">{job.apply_link}</h5>
                            </div>

                        </Col>
                    </Row>
                </Card>
            </Container>
        </div>

    );
};

export default JobDetails;
