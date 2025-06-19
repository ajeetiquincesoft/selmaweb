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
  document.title = "Parks & Recreation Details  | City of Selma";
  return (
    <div className="page-content">
      <ul className="breadcrumb">
        <li>
          <Link to="/"><a href="/">Home /</a></Link>
        </li>
        <li>
          <Link to="/parks-recreation-list"><a href="/">Parks & Recreation List /</a></Link>
        </li>
        <li className="active">Parks & Recreation Details</li>
      </ul>

      <Container>
        {/* Breadcrumb */}

        {/* Main Info Card */}


        <Card className="p-4 mb-4 shadow-sm">
          <Row className="mb-4">
            {/* Featured Image */}
            <Col md={6} className="d-flex justify-content-center align-items-center text-center">
              <img
                src={park.featured_image || "default.jpg"}
                alt={park.title}
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
                      Park
                    </Link>
                  </div>
                </Col>
                <Col md={6} className="text-md-end">
                  <Link to={`/edit-park/${park.id}`} className="btn btn-sm btn-primary">
                    Edit Park
                  </Link>
                </Col>
              </Row>

              <div className="bg-light p-3">
                {/* Title and Date */}
                <Row className="mb-3">
                  <Col md={8}>
                    <h4 className="mb-2">{park.title}</h4>
                  </Col>
                  <Col md={4} className="text-end">
                    <h6 className="text-muted text-sm mb-2">Published Date</h6>
                    <h5 className="font-size-15">
                      {new Date(park.published_at).toLocaleDateString("en-GB", {
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
                    <div dangerouslySetInnerHTML={{ __html: park.shortdescription }} />
                  </Col>
                </Row>

                <hr style={{ border: "1px solid #c7c7c7" }} />

                {/* Details Grid */}
                <div className="text-center">
                  <Row className="mb-3">
                    <Col sm={3}>
                      <p className="text-muted mb-2">Date</p>
                      <h5 className="font-size-15">
                        {new Date(park.date).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </h5>
                    </Col>
                    <Col sm={3}>
                      <p className="text-muted mb-2">Time</p>
                      <h5 className="font-size-15">{park.time}</h5>
                    </Col>
                    <Col sm={3}>
                      <p className="text-muted mb-2">Organizer</p>
                      <h5 className="font-size-15">{park.organizor}</h5>
                    </Col>
                    <Col sm={3}>
                      <p className="text-muted mb-2">Link</p>
                      <h5 className="font-size-15">{park.link}</h5>
                    </Col>

                  </Row>
                </div>
              </div>
            </Col>
          </Row>
        </Card>






        <Card className="p-4 mb-4 shadow-sm">
          {/* Description */}
          <h4 className="mb-3">Description</h4>
          <Card className="p-3 mb-4 bg-light">
            <div dangerouslySetInnerHTML={{ __html: park.description }} />
          </Card>
        </Card>

        <Card className="p-4 mb-4 shadow-sm">
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

          {park.images && park.images.length > 0 && (
            <>
              <h4 className="mb-3 mt-4">Gallery</h4>
              <div
                style={{
                  display: "flex",
                  overflowX: "auto",
                  gap: "16px", // spacing between images
                  paddingBottom: "10px"
                }}
              >
                {park.images.map((image, index) => (
                  <div key={index} style={{ minWidth: "200px", flex: "0 0 auto" }}>
                    <Card className="h-100">
                      <img
                        src={image}
                        alt={`${park.title} ${index + 1}`}
                        className="img-fluid rounded"
                        style={{ height: "200px", width: "100%", objectFit: "contain" }}
                      />
                    </Card>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      </Container>
    </div>


  );
};

export default ParkDetails;