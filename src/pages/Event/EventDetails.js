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
import BASE_URL from "path"; // Replace with actual path
import axios from "axios";

const EventDetails = () => {
    const { id } = useParams();
    const [token, setToken] = useState(null);
    const [event, setEvent] = useState(null);
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
            fetchEventDetails(id);
        }
    }, [token, id]);

    const fetchEventDetails = async (eventId) => {
        try {
            setLoading(true);
            const response = await axios.get(`${BASE_URL}/auth/getEventById/${eventId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setEvent(response.data.data || null);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch event details", err);
            setError("Failed to load event details");
            setLoading(false);
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    document.title = "Event Details";
    document.title = " Event Details | City of Selma";
    return (
        <div className="page-content">
            <ul className="breadcrumb">
                <li>
                    <Link to="/"><a href="/">Home /</a></Link>
                </li>
                <li>
                    <Link to="/event-list"><a href="/">Event List /</a></Link>
                </li>
                <li className="active">Event Details</li>
            </ul>
            <Container>
                {/* Breadcrumb */}


                {/* Main Event Card */}
                <Card className="p-4 mb-4 shadow-sm">
                    <Row className="mb-4">
                        {/* Featured Image */}
                        <Col md={6} className="d-flex justify-content-center align-items-center text-center">
                            <img
                                src={event.featured_image || "default.jpg"}
                                alt={event.title}
                                className="img-fluid rounded"
                                style={{ maxHeight: "350px", objectFit: "cover" }}
                            />
                        </Col>

                        {/* Right Info Column */}
                        <Col md={6}>
                            <Row className="align-items-center mb-3">
                                <Col md={6}>
                                    <div className="mb-4">
                                        <Link to="#" className="badge bg-light font-size-12">
                                            <i className="bx bx-purchase-tag-alt align-middle text-muted me-1"></i>
                                            Event
                                        </Link>
                                    </div>
                                </Col>
                                <Col md={6} className="text-md-end">
                                    <Link to={`/edit-event/${event.id}`} className="btn btn-sm btn-success">
                                        Edit Event
                                    </Link>
                                </Col>
                            </Row>

                            <div className="bg-light p-3">
                                {/* Title and Date */}
                                <Row className="mb-3">
                                    <Col md={8}>
                                        <h4 className="mb-2">{event.title}</h4>
                                    </Col>
                                    <Col md={4} className="text-end">
                                        <h6 className="text-muted text-sm mb-2">Event Date & Time</h6>
                                        <h5 className="font-size-15">
                                            {new Date(event.date).toLocaleDateString("en-GB", {
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
                                        <div className="text-muted mb-2">Short Description</div>
                                        <div dangerouslySetInnerHTML={{ __html: event.shortdescription }} />
                                    </Col>
                                </Row>

                                <hr style={{ border: "1px solid #c7c7c7" }} />

                                {/* Details Grid */}
                                <div className="text-center">
                                    <Row className="mb-3">
                                        <Col sm={3}>
                                            <p className="text-muted mb-2">Category</p>
                                            <h5 className="font-size-15">{event.category?.name}</h5>
                                        </Col>
                                        <Col sm={3}>
                                            <p className="text-muted mb-2">Posted By</p>
                                            <h5 className="font-size-15">{event.organizor}</h5>
                                        </Col>
                                        <Col sm={3}>
                                            <p className="text-muted mb-2">Venue</p>
                                            <h5 className="font-size-15">{event.address}</h5>
                                        </Col>
                                        <Col sm={3}>
                                            <p className="text-muted mb-2">Created At</p>
                                            <h5 className="font-size-15">
                                                {new Date(event.createdAt).toLocaleDateString("en-GB", {
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "numeric",
                                                })}
                                            </h5>
                                        </Col>
                                    </Row>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Card>

                {/* Description */}
                <Card className="p-4 mb-4 shadow-sm">
                    <h5 className="mb-3">Description</h5>
                    <Card className="p-3 mb-4 bg-light">
                        <div dangerouslySetInnerHTML={{ __html: event.description }} />
                    </Card>
                </Card>

                {/* Event Images */}
                {event.files && event.files.length > 0 && (
                    <Card className="p-4 mb-4 shadow-sm">
                        <h4 className="mb-3 mt-4">Event Gallery</h4>
                        <div
                            style={{
                                display: "flex",
                                overflowX: "auto",
                                gap: "16px",
                                paddingBottom: "10px"
                            }}
                        >
                            {event.files.map((img, index) => (
                                <div key={index} style={{ minWidth: "200px", flex: "0 0 auto" }}>
                                    <Card className="h-100">
                                        <img
                                            src={img}
                                            alt={`event-img-${index}`}
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

    );
};

export default EventDetails;
