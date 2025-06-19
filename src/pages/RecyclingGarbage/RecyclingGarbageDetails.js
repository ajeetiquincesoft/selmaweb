import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Container, Row, Col, Spinner, Card, CardBody, Button } from "reactstrap";
import axios from "axios";
import BASE_URL from "path"; // Replace with your actual path

const RecyclingGarbageDetails = () => {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const storedUser = localStorage.getItem("authUser");
                const { token } = JSON.parse(storedUser);
                const response = await axios.get(`${BASE_URL}/auth/getRecyclingAndGarbageById/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setData(response.data.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching details:", error);
                setLoading(false);
            }
        };

        fetchDetail();
    }, [id]);

    if (loading) {
        return (
            <div className="text-center mt-5">
                <Spinner color="primary" />
            </div>
        );
    }

    if (!data) {
        return (
            <Container className="mt-5">
                <h4 className="text-danger text-center">Data not found.</h4>
            </Container>
        );
    }
    document.title = "Recycling & Garbage Details | City of Selma";
    return (
        <div className="page-content">
            <ul className="breadcrumb">
                <li>
                    <Link to="/"><a href="/">Home /</a></Link>
                </li>
                <li>
                    <Link to="/recycling-garbage-list"><a href="/">Recycling & Garbage List /</a></Link>
                </li>
                <li className="active">Recycling & Garbage Details</li>
            </ul>
            <Container>
                {/* Breadcrumb */}


                {/* Main Card */}
                <Card className="p-4 mb-4 shadow-sm">
                    <Row className="mb-4">
                        {/* Left: Image */}
                        <Col md={6} className="d-flex justify-content-center align-items-center text-center">
                            <img
                                src={data.image || "default.jpg"}
                                alt={data.title}
                                className="img-fluid rounded"
                                style={{ maxHeight: "350px", objectFit: "cover" }}
                            />
                        </Col>

                        {/* Right: Info */}
                        <Col md={6}>
                            {/* Header Row */}
                            <Row className="align-items-center mb-3">
                                <Col md={6}>
                                    <div className="mb-4">
                                        <Link to="#" className="badge bg-light font-size-12">
                                            <i className="bx bx-recycle align-middle text-muted me-1"></i>
                                            Recycling & Garbage
                                        </Link>
                                    </div>
                                </Col>
                                <Col md={6} className="text-md-end">
                                    <Link to={`/edit-recycling-garbage/${data.id}`} className="btn btn-sm btn-primary">
                                        Edit
                                    </Link>
                                </Col>
                            </Row>

                            {/* Details Box */}
                            <div className="bg-light p-3">
                                <Row>
                                    <Col sm={6}>
                                        <p className="text-muted mb-2">Created Date</p>
                                        <h5 className="font-size-15">
                                            {new Date(data.createdAt).toLocaleDateString("en-GB", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </h5>
                                    </Col>
                                    <Col sm={6}>
                                        <p className="text-muted mb-2">Posted By</p>
                                        <h5 className="font-size-15">{data.author?.name || "Admin"}</h5>
                                    </Col>
                                </Row>

                                <hr style={{ border: "1px solid #c7c7c7" }} />

                                <p className="text-muted mb-2">Short Description</p>
                                <p>{data.shortdescription}</p>
                            </div>
                        </Col>
                    </Row>
                </Card>
                <Card className="p-4 mb-4 shadow-sm">
                    {/* Description Section */}
                    <h4 className="mb-3">Description</h4>
                    <Card className="p-3 bg-light">
                        <div dangerouslySetInnerHTML={{ __html: data.description }} />
                    </Card>
                </Card>
            </Container>
        </div >

    );
};

export default RecyclingGarbageDetails;
