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
            console.log(response);
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

    return (
        <div className="page-content">
            <Container fluid>
                <Breadcrumbs title="Event" breadcrumbItem="Event Details" />

                <Row>
                    <Col lg={12}>
                        <Card>
                            <CardBody>
                                <Row className="justify-content-center">
                                    <Col xl={8}>
                                        <div className="text-center">
                                            <div className="mb-4">
                                                <Link to="#" className="badge bg-light font-size-12">
                                                    <i className="bx bx-purchase-tag-alt align-middle text-muted me-1"></i>
                                                    Event
                                                </Link>
                                            </div>
                                            <h4>{event.title}</h4>
                                            <p className="text-muted mb-4">
                                                <div dangerouslySetInnerHTML={{ __html: event.shortdescription }} />
                                            </p>
                                        </div>

                                        <hr />

                                        <div className="text-center">
                                            <Row>
                                                <Col sm={4}>
                                                    <p className="text-muted mb-2">Category</p>
                                                    <h5 className="font-size-15">{event.category?.name}</h5>
                                                </Col>
                                                <Col sm={4}>
                                                    <p className="text-muted mb-2">Date</p>
                                                    <h5 className="font-size-15">
                                                        {new Date(event.createdAt).toLocaleDateString("en-GB", {
                                                            day: "2-digit",
                                                            month: "short",
                                                            year: "numeric",
                                                        })}
                                                    </h5>
                                                </Col>
                                                <Col sm={4}>
                                                    <p className="text-muted mb-2">Posted by</p>
                                                    <h5 className="font-size-15">{event.author?.name}</h5>
                                                    
                                                </Col>
                                            </Row>
                                        </div>

                                        <hr />

                                        <div className="my-5">
                                            <img
                                                src={event.featured_image}
                                                alt=""
                                                className="img-thumbnail mx-auto d-block"
                                            />
                                        </div>
                                        
                                        <div style={{ overflowX: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>
                                            {event.files && event.files.map((img, index) => (
                                                <img
                                                    key={index}
                                                    src={img}
                                                    alt={`event-img-${index}`}
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
                                            <div dangerouslySetInnerHTML={{ __html: event.description }} />
                                        </div>
                                    </Col>
                                </Row>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default EventDetails;
