import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Card, Container, Table, Badge, Button, Row, Col, Alert
} from "reactstrap";
import axios from "axios";
import BASE_URL from "path"; // Update to your actual BASE_URL

const ParkDetails = () => {
  const { id } = useParams();
  const [park, setPark] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("authUser");
    if (storedUser) {
      const { token } = JSON.parse(storedUser);
      setToken(token);
    }
    fetchParkDetails();
  }, [id]);

  const fetchParkDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/auth/getAllParksAndRecreationById/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPark(response.data.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch park details", err);
      setError("Failed to load park details");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-content">
        <Container>
          <Alert color="info">Loading park details...</Alert>
        </Container>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-content">
        <Container>
          <Alert color="danger">{error}</Alert>
          <Link to="/parks" className="btn btn-primary">
            Back to Parks List
          </Link>
        </Container>
      </div>
    );
  }

  if (!park) {
    return (
      <div className="page-content">
        <Container>
          <Alert color="warning">Park not found</Alert>
          <Link to="/parks" className="btn btn-primary">
            Back to Parks List
          </Link>
        </Container>
      </div>
    );
  }

  // Parse facilities if it's a string
  const facilities = typeof park.facilities === 'string'
    ? JSON.parse(park.facilities)
    : park.facilities || [];

  return (
    <div className="page-content">
      <Container>
        <ul className="breadcrumb">
          <li>
            <Link to="/"><a href="/">Home /</a></Link>
          </li>
          <li>
            <Link to="/parks-recreation-list"><a href="/">Parks & Recreation List /</a></Link>
          </li>
          <li className="active">Parks & Recreation Details</li>
        </ul>
        <Card className="p-4 mb-4 shadow-sm">
          <Row className="mb-4">
            <Col md={6}>
              <img
                src={park.featured_image || "default.jpg"}
                alt={park.title}
                className="img-fluid rounded"
                style={{ maxHeight: "350px", objectFit: "cover" }}
              />
            </Col>
            <Col md={6}>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h2 className="mb-2">{park.title}</h2>
                  <div className="d-flex gap-2 mb-3">
                    <Badge color={park.status === "1" ? "success" : "warning"}>
                      {park.status === "1" ? "Published" : park.status === "0" ? "Unpublished" : "Draft"}
                    </Badge>
                    <Badge color="info">
                      {park.category?.name || "Uncategorized"}
                    </Badge>
                  </div>
                </div>
                <Link to={`/edit-park/${park.id}`} className="btn btn-sm btn-primary">
                  Edit Park
                </Link>
              </div>

              <Table bordered className="mb-4">
                <tbody>
                  <tr>
                    <th width="30%">Created Date</th>
                    <td>{new Date(park.createdAt).toLocaleDateString()}</td>
                  </tr>
                  <tr>
                    <th>Short Description</th>
                    <td>{park.shortdescription}</td>
                  </tr>
                </tbody>
              </Table>
            </Col>
          </Row>

          <h4 className="mb-3">Description</h4>
          <Card className="p-3 mb-4 bg-light">
            <div dangerouslySetInnerHTML={{ __html: park.description }} />
          </Card>

          <h4 className="mb-3">Event Details</h4>
          <Table bordered striped className="mb-4">
            <tbody>
              <tr>
                <th width="30%">Date</th>
                <td>{park.date}</td>
              </tr>
              <tr>
                <th>Time</th>
                <td>{park.time}</td>
              </tr>
              <tr>
                <th>Organizer</th>
                <td>{park.organizer}</td>
              </tr>
              <tr>
                <th>Published At</th>
                <td>{new Date(park.published_at).toLocaleString()}</td>
              </tr>
              <tr>
                <th>Website Link</th>
                <td>
                  <a href={park.link} target="_blank" rel="noopener noreferrer">
                    {park.link}
                  </a>
                </td>
              </tr>
            </tbody>
          </Table>

          {/* Facilities Section */}
          <h4 className="mb-3">Facilities</h4>
          {facilities.length > 0 ? (
            <Table bordered striped responsive>
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Facility Name</th>
                  <th>Address</th>
                  <th>Amenities</th>
                </tr>
              </thead>
              <tbody>
                {facilities.map((facility, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{facility.name || `Facility ${index + 1}`}</td>
                    <td>{facility.address}</td>
                    <td>
                      {facility.amenities && facility.amenities.length > 0 ? (
                        <ul className="mb-0">
                          {facility.amenities.map((amenity, amenityIndex) => (
                            <li key={amenityIndex}>{amenity}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-muted">No amenities listed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <Alert color="info">No facilities information available</Alert>
          )}

          {/* Gallery Section */}
          {park.images && park.images.length > 0 && (
            <>
              <h4 className="mb-3 mt-4">Gallery</h4>
              <Row>
                {park.images.map((image, index) => (
                  <Col md={4} className="mb-3" key={index}>
                    <Card className="h-100">
                      <img
                        src={image}
                        alt={`${park.title} ${index + 1}`}
                        className="img-fluid rounded"
                        style={{ height: "200px", objectFit: "cover" }}
                      />
                    </Card>
                  </Col>
                ))}
              </Row>
            </>
          )}
        </Card>
      </Container>
    </div>
  );
};

export default ParkDetails;