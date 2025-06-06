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
    console.log(id);
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
            console.log(response);
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

    document.title = "Job Details";

    return (
        <div className="page-content">
            <Container fluid>
                <Breadcrumbs title="Jobs" breadcrumbItem="Job Details" />
                <Row>
                    <Col lg={12}>
                        <Card>
                            <CardBody>
                                <div className="pt-3">
                                    <Row className="justify-content-center">
                                        <Col xl={8}>
                                            <div>
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
                                                    <h4>{job.title}</h4>
                                                    <p className="text-muted mb-4">
                                                        <div dangerouslySetInnerHTML={{ __html: job.shortdescription }} />
                                                    </p>
                                                </div>

                                                <hr />
                                                <div className="text-center">
                                                    <Row>
                                                        <Col sm={4}>
                                                            <div>
                                                                <p className="text-muted mb-2">Categories</p>
                                                                <h5 className="font-size-15">{job.category?.name}</h5>
                                                            </div>
                                                        </Col>
                                                        <Col sm={4}>
                                                            <div className="mt-4 mt-sm-0">
                                                                <p className="text-muted mb-2">Date</p>
                                                                <h5 className="font-size-15">

                                                                    {new Date(job.createdAt).toLocaleDateString("en-GB", {
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
                                                                <h5 className="font-size-15">{job.user?.name}</h5>
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                </div>
                                                <hr />

                                                <div className="my-5">
                                                    <img
                                                        src={job.featured_image}
                                                        alt=""
                                                        className="img-thumbnail mx-auto d-block"
                                                    />
                                                </div>
                                                <hr />

                                                <div className="mt-4">
                                                    <div className="">

                                                        <div dangerouslySetInnerHTML={{ __html: job.description }} />
                                                    </div>
                                                </div>
                                                <hr />
                                                <div className="mt-4 mt-sm-0">
                                                    <p className="text-muted mb-2">Job Link </p>
                                                    <h5 className="font-size-15">{job.link}</h5>
                                                </div>
                                                <hr />
                                                <div className="mt-4 mt-sm-0">
                                                    <p className="text-muted mb-2">Job Apply Link </p>
                                                    <h5 className="font-size-15">{job.apply_link}</h5>
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
    );
};

export default JobDetails;
