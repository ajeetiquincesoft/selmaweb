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
      <ul className="breadcrumb">
        <li>
          <Link to="/"><a href="/">Home /</a></Link>
        </li>
        <li>
          <Link to="/page-list"><a href="/">Page List /</a></Link>
        </li>
        <li className="active">Page Details</li>
      </ul>
      <Container>

        <Card className="p-4 mb-4 shadow-sm">
          <Row className="mb-4">
            {/* Left Column: Featured Image */}
            <Col md={6} className="d-flex flex-column align-items-center text-center">
              <img
                src={page.featured_image || "default.jpg"}
                alt={page.title}
                className="img-fluid rounded"
                style={{ maxHeight: "350px", objectFit: "cover" }}
              />

              {/* Content below the image */}
              <div className="mt-3">
                <h4 className="text-muted mb-1">{page.name}</h4>
                <h5 className="font-size-15 mb-0">{page.designation}</h5>
              </div>
            </Col>

            {/* Right Column: Page Details */}
            <Col md={6}>
              {/* Header Row: Badge + Edit Button */}
              <Row className="align-items-center mb-3">
                <Col md={6}>
                  <div >
                    <Link to="#" className="badge bg-light font-size-12">
                      <i className="bx bx-purchase-tag-alt align-middle text-muted me-1"></i>
                      Page
                    </Link>
                  </div>
                </Col>
                <Col md={6} className="text-md-end">
                  <Link to={`/edit-page/${page.id}`} className="btn btn-sm btn-primary">
                    Edit Page
                  </Link>
                </Col>
              </Row>

              {/* Page Info Box */}
              <div className="bg-light p-3">

                {/* Title & Publish Date */}
                <Row className="mb-3">
                  <Col md={8}>
                    <h4 className="mb-2">{page.title}</h4>
                  </Col>
                  <Col md={4} className="text-end">
                    <h6 className="text-muted text-sm mb-2">Published Date</h6>
                    <h5 className="font-size-15">
                      {new Date(page.published_at).toLocaleDateString("en-GB", {
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
                    <p>{page.shortdescription}</p>
                  </Col>
                </Row>

                <hr style={{ border: "1px solid #c7c7c7" }} />

                {/* Category, Created Date, Author */}
                <div className="text-center">
                  <Row className="mb-3">
                    <Col sm={6}>
                      <p className="text-muted mb-2">Category</p>
                      <h5 className="font-size-15">{page.category?.name}</h5>
                    </Col>
                    <Col sm={6}>
                      <p className="text-muted mb-2">Created Date</p>
                      <h5 className="font-size-15">
                        {new Date(page.createdAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </h5>
                    </Col>

                  </Row>

                  <hr style={{ border: "1px solid #c7c7c7" }} />

                  {/* Designation, Address, Contacts */}
                </div>
              </div>
            </Col>
          </Row>

        </Card>

        <Card className="p-4 mb-4 shadow-sm">
          <h5 className="mb-3">Description</h5>
          <Card className="p-3 mb-4 bg-light">
            <div dangerouslySetInnerHTML={{ __html: page.description }} />
          </Card>
        </Card>

        {(page.address || page.contacts || page.hours) && (
          <Card className="p-4 mb-4 shadow-sm">
            <Row>
              {page.address && (
                <Col sm={4}>
                  <p className="text-muted mb-2">Address</p>
                  <div dangerouslySetInnerHTML={{ __html: page.address }} />
                </Col>
              )}

              {page.contacts && (
                <Col sm={4}>
                  <p className="text-muted mb-2">Contacts</p>
                  <div dangerouslySetInnerHTML={{ __html: page.contacts }} />
                </Col>
              )}

              {page.hours && (
                <Col sm={4}>
                  <p className="text-muted mb-2">Hours</p>
                  <div dangerouslySetInnerHTML={{ __html: page.hours }} />
                </Col>
              )}
            </Row>
          </Card>
        )}


        {page.counsil_members && page.counsil_members.length > 0 ? (
          <>
            <Card className="p-4 mb-4 shadow-sm">
              <h4 className="mb-3 mt-4">Counsilm Members</h4>
              <div className="table-responsive  bg-light">
                <table className="table table-bordered bg-light align-middle text-center">
                  <thead className="table-light">
                    <tr>
                      <th>Name</th>
                      <th>Designation</th>
                      <th>Image</th>
                    </tr>
                  </thead>
                  <tbody>
                    {page.counsil_members.map((member, index) => (
                      <tr key={index}>
                        <td>{member.name}</td>
                        <td>{member.designation}</td>
                        <td>
                          <img
                            src={member.image}
                            alt={member.name}
                            style={{
                              height: "50px",
                              width: "50px",
                              objectFit: "cover",
                              borderRadius: "8px",
                            }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>

        ) : (
          <div className="mt-4">

          </div>
        )
        }

        {
          page.images && page.images.length > 0 && (
            <>
              <Card className="p-4 mb-4 shadow-sm">
                <h4 className="mb-3 mt-4">Images</h4>
                <div
                  style={{
                    display: "flex",
                    overflowX: "auto",
                    gap: "16px", // spacing between images
                    paddingBottom: "10px"
                  }}
                >
                  {page.images.map((image, index) => (
                    <div key={index} style={{ minWidth: "200px", flex: "0 0 auto" }}>
                      <Card className="h-100">
                        <img
                          src={image}
                          alt={`${page.title} ${index + 1}`}
                          className="img-fluid rounded"
                          style={{ height: "200px", width: "100%", objectFit: "contain" }}
                        />
                      </Card>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )
        }

      </Container >
    </div >
  );
};

export default PageDetails;
