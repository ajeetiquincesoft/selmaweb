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
            <Container className="">
                <ul className="breadcrumb">
                    <li>
                        <Link to="/"><a href="/">Home /</a></Link>
                    </li>
                    <li>
                        <Link to="/recycling-garbage-list"><a href="/">Recycling & Garbage list /</a></Link>
                    </li>
                    <li className="active">Recycling & Garbage Details</li>
                </ul>
                <Row className="justify-content-center">
                    <Col lg={10}>
                        <Card className="shadow rounded border-0">

                            <CardBody>
                                <div className="text-end">
                                    <Link to={`/edit-park/${data.id}`} className="btn btn-sm btn-primary">
                                        Edit
                                    </Link>
                                </div>

                                <h2 className="mb-3 text-center">{data.title}</h2>
                                <p className="text-muted text-center">
                                    {new Date(data.createdAt).toLocaleDateString("en-GB", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                    })}{" "}
                                    | <strong>{data.author?.name || "Admin"}</strong>
                                </p>
                                <p>{data.shortdescription}</p>
                                {data.image && (
                                    <img
                                        src={data.image}
                                        alt={data.title}
                                        className="img-fluid rounded text-center mb-4"
                                    />
                                )}
                                <div
                                    dangerouslySetInnerHTML={{ __html: data.description }}
                                    className="mt-3"
                                />
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default RecyclingGarbageDetails;
