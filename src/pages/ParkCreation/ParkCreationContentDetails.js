import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Container, Row, Col, Spinner, Alert, Card } from "reactstrap";
import axios from "axios";
import BASE_URL from "path"; // Replace with actual BASE_URL

const ParkDetails = () => {
  const { id } = useParams();
  const [park, setPark] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [token, setToken] = useState(null);

  useEffect(() => {
    const user = localStorage.getItem("authUser");
    if (user) {
      const token = JSON.parse(user).token;
      setToken(token);
      fetchParkDetails(token);
    } else {
      setError("Unauthorized");
      setLoading(false);
    }
  }, []);

  const fetchParkDetails = async (authToken) => {
    try {
      const res = await axios.get(`${BASE_URL}/auth/getparksandrecreationcontentbyid/${id}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      dd(res);
      setPark(res.data.data);
    } catch (err) {
      setError("Failed to load park details.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center mt-5"><Spinner color="primary" /></div>;
  }

  if (error) {
    return <Alert color="danger" className="text-center mt-5">{error}</Alert>;
  }

  if (!park) {
    return <Alert color="warning" className="text-center mt-5">No park data found.</Alert>;
  }
document.title = "Parks & Recreation Details Page | City of Selma";
  return (
    <Container className="mt-5">
      <Row>
        <Col md={12}>
        
          <Card className="p-4 shadow-sm">
            <Row>
              <Col md={6}>
                <img
                  src={park.image || "/placeholder.jpg"}
                  alt="Park"
                  className="img-fluid rounded"
                />
              </Col>
              <Col md={6}>
                <h2 className="mb-3">Mission</h2>
                <p>{park.mission}</p>

                <h2 className="mt-4">Vision</h2>
                <p>{park.vision}</p>

                <h4 className="mt-4">Address</h4>
                <p>{park.address}</p>

                <h4>Hours</h4>
                <p>{park.hours}</p>

                <h4>Contacts</h4>
                <p>{park.contacts}</p>

                <h4>Status</h4>
                <span className={`badge bg-${park.status === 1 ? "success" : park.status === 2 ? "warning" : "secondary"}`}>
                  {park.status === 1 ? "Published" : park.status === 2 ? "Draft" : "Unpublished"}
                </span>

                <div className="mt-4">
                  <Link to="/parks" className="btn btn-secondary">
                    &larr; Back to List
                  </Link>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ParkDetails;
