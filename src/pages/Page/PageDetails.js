import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardImg,
  Spinner,
  Alert,
  Badge,
  Table
} from 'reactstrap';
import axios from 'axios';
import BASE_URL from 'path'; // Replace with your actual BASE_URL
import { format } from 'date-fns';

const PageDetails = () => {
  const { id } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Get token from localStorage
    const storedUser = localStorage.getItem("authUser");
    if (storedUser) {
      const { token } = JSON.parse(storedUser);
      setToken(token);
    }
  }, []);

  useEffect(() => {
    if (token && id) {
      fetchPageDetails(id);
    }
  }, [token, id]);

  const fetchPageDetails = async (id) => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/auth/getPageById/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response);
      setPage(response.data.data || null);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch page details", err);
      setError("Failed to load page details");
      setLoading(false);
    }
  };
  document.title = "Page  Details  | City of Selma";
  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner color="primary" />
        <p>Loading page details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Container className="my-5">
        <Alert color="danger">{error}</Alert>
        <Link to="/pages" className="btn btn-primary mt-3">
          Back to Pages
        </Link>
      </Container>
    );
  }

  if (!page) {
    return (
      <Container className="my-5">
        <Alert color="warning">Page not found</Alert>
        <Link to="/pages" className="btn btn-primary mt-3">
          Back to Pages
        </Link>
      </Container>
    );
  }

  return (
    <div className="page-content">
      <Container>
        <ul className="breadcrumb">
          <li>
            <Link to="/"><a href="/">Home /</a></Link>
          </li>
          <li>
            <Link to="/page-list"><a href="/">Page List /</a></Link>
          </li>
          <li className="active">Page Details</li>
        </ul>
        <Card className="p-4 mb-4 shadow-sm">
          <Row className="mb-4">
            <Col md={6} className='d-flex text-center justify-content-center'>
              <img
                src={page.featured_image || "default.jpg"}
                alt={page.title}
                className="img-fluid rounded"
                style={{ maxHeight: "350px", objectFit: "cover" }}
              />
            </Col>
            <Col md={6} className='bg-light p-3'>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h4 className="mb-2">{page.title}</h4>
                  <p>{page.shortdescription}</p>
                  <hr style={{ border: '1px solid #c7c7c7' }} />
                  {/* <div className="d-flex gap-2 mb-3">
                    <Badge color={page.status === "1" ? "success" : "warning"}>
                      {page.status === "1" ? "Published" : page.status === "0" ? "Unpublished" : "Draft"}
                    </Badge>
                  </div> */}
                </div>

                {/* <Link to={`/edit-park/${park.id}`} className="btn btn-sm btn-primary">
                  Edit Park
                </Link> */}
              </div>
              <div className="text-center">
                <Row>
                  <Col sm={4}>
                    <div>
                      <p className="text-muted mb-2">Categories</p>
                      <h5 className="font-size-15">{page.category?.name}</h5>
                    </div>
                  </Col>
                  <Col sm={4}>
                    <div className="mt-4 mt-sm-0">
                      <p className="text-muted mb-2">Date</p>
                      <h5 className="font-size-15">

                        {new Date(page.createdAt).toLocaleDateString("en-GB", {
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
                      <h5 className="font-size-15">{page.name}</h5>
                    </div>
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>
        </Card>

        <Card className="p-4 mb-4 shadow-sm">
          <h5 className="mb-3">Description</h5>
          <Card className="p-3 mb-4 bg-light">
            <div dangerouslySetInnerHTML={{ __html: page.description }} />
          </Card>

          <h4 className="mb-3">Event Details</h4>
          <Table bordered striped className="mb-4">
            <tbody>
              <tr>
                <th width="30%">Date</th>
                <td>{page.date}</td>
              </tr>

              <tr>
                <th>Name</th>
                <td>{page.name}</td>
              </tr>
              <tr>
                <th>Published At</th>
                <td>{new Date(page.published_at).toLocaleString()}</td>
              </tr>
            </tbody>
          </Table>


          {/* <h4 className="mb-3">Facilities</h4> */}
          {/* {facilities.length > 0 ? (
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
          )} */}

          {page.images && page.images.length > 0 && (
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

export default PageDetails;
