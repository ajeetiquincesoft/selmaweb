import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  Container,
  Row,
  Col,
  Button,
  Card,
  CardBody,
  CardTitle,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Table
} from "reactstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import classNames from "classnames";
import moment from "moment"; // For formatting date/time

//import Charts
import StackedColumnChart from "./StackedColumnChart";

//import action
import { getChartsData as onGetChartsData } from "../../store/actions";

// Image
import modalimage1 from "../../assets/images/product/img-7.png";
import modalimage2 from "../../assets/images/product/img-4.png";

// Pages Components
import WelcomeComp from "./WelcomeComp";
import MonthlyEarning from "./MonthlyEarning";
import SocialSource from "./SocialSource";
import ActivityComp from "./ActivityComp";
import TopCities from "./TopCities";
import LatestTranaction from "./LatestTranaction";
import avatar1 from "../../assets/images/users/avatar-1.jpg"
import profileImg from "../../assets/images/profile-img.png"
import Logo from "../../assets/images/logo_circle.png"


//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb";
import BASE_URL from "path"; // Replace with your actual BASE_URL import

//i18n
import { withTranslation } from "react-i18next";

//redux
import { useSelector, useDispatch } from "react-redux";
import { createSelector } from "reselect";

const Dashboard = props => {
  const [modal, setModal] = useState(false);
  const [subscribeModal, setSubscribeModal] = useState(false);
  const [token, setToken] = useState(null);

  const [Homedata, setDashboard] = useState();
  const [userData, setUser] = useState();

  const [latestjobs, setLatestJobs] = useState([]);
  const [latestnews, setLatestNews] = useState([]);
  const [latestevents, setLatestEvent] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [profileImage, setProfileImage] = useState("");


  useEffect(() => {
    const storedUser = localStorage.getItem("authUser");
    if (storedUser) {
      const { token } = JSON.parse(storedUser);
      setToken(token);

    }
  }, []); // run once on mount

  useEffect(() => {
    if (token) {
      fetchUserData(token)
      fetchDashboardData();
    }
  }, [token]); // run only when token is set


  const fetchUserData = async (token) => {
    try {
      const response = await axios.get(`${BASE_URL}/auth/getauthuser`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const userData = response.data;
      setProfileImage(userData.meta.profile_pic);
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/auth/getDashboardData`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const { data, user, latest } = response?.data;

      setDashboard(data);
      setUser(user);
      setLatestJobs(data?.latest?.jobs || []);
      setLatestNews(data?.latest?.news || []);
      setLatestEvent(data?.latest?.events || []);
      const monthlyStats = data?.monthlyStats;

      if (data?.monthlyStats) {
        const { jobs = [], news = [], events = [] } = data.monthlyStats;

        const transformedChartData = jobs.map((jobItem, index) => ({
          month: jobItem.month,
          jobs: jobItem.count || 0,
          news: news[index]?.count || 0,
          events: events[index]?.count || 0,
        }));
        setChartData(transformedChartData);
      }
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  };
  useEffect(() => {
    setTimeout(() => {
      setSubscribeModal(true);
    }, 2000);
  }, []);

  //meta title
  document.title = "Dashboard | City of selma";
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          {/* Render Breadcrumb */}
          <Breadcrumbs title={props.t("Dashboards")} breadcrumbItem={props.t("Dashboard")} />

          <Row>
            <Col xl="4">
              <Card className="overflow-hidden">
                <div className="bg-primary-subtle">
                  <Row>
                    <Col xs="7">
                      <div className="text-primary p-3">
                        <h5 className="text-primary">Welcome Back !</h5>
                        <p> Selma Dashboard</p>
                      </div>
                    </Col>
                    <Col xs="5" className="align-self-end">

                    
                      <img src={profileImg} alt="" className="img-fluid" />
                    </Col>
                  </Row>
                </div>
                <CardBody className="pt-0">
                  <Row>
                    <Col sm="4">
                      <div className="avatar-md profile-user-wid mb-4">
                        <img
                          src={profileImage}
                          alt=""
                          className="img-thumbnail rounded-circle"
                        />
                      </div>
                      <h5 className="font-size-15 text-truncate">{userData?.name}</h5>
                      <p className="text-muted mb-0 text-truncate">Admin</p>
                    </Col>

                    <Col sm="8">
                      <div className="pt-4">
                        <Row>
                          <Col xs="12">
                            <h5 className="font-size-15">{userData?.email}</h5>

                          </Col>

                        </Row>
                        <div className="mt-4">
                          <Link
                            to="/profile"
                            className="btn btn-primary  btn-sm"
                          >
                            View Profile <i className="mdi mdi-arrow-right ms-1"></i>
                          </Link>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <CardTitle className="mb-4">Social Source</CardTitle>
                  <div className="text-center">
                    <div className="avatar-sm mx-auto mb-4">
                      <span className="avatar-title rounded-circle bg-primary-subtle font-size-24">
                        <img src={Logo} alt="Logo" />
                      </span>
                    </div>
                    <p className="font-16 text-muted mb-2"></p>

                    <p className="text-muted">
                      Selma is located high on the banks of the Alabama River in Dallas County of which it is the county seat.
                      The city is best known for the Battle of Selma and for the Selma to Montgomery Marches.
                    </p>
                    
                  </div>
                  <Row className="mt-4">
                    <Col xs={4} >
                      <a
                        href="https://www.facebook.com/SELMACITYHALL"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-decoration-none text-dark"
                      >
                        <div className="social-source text-center mt-3">
                          <div className="avatar-xs mx-auto mb-3">
                            <span className={"avatar-title rounded-circle bg-primary font-size-16"}>
                              <i className={"mdi mdi-facebook text-white"}></i>
                            </span>
                          </div>
                          <h5 className="font-size-15">Facebook</h5>
                          {/* <p className="text-muted mb-0">{social.description} sales</p> */}
                        </div>
                      </a>
                    </Col>
                    <Col xs={4}>
                      <a
                        href="https://x.com/cityofselma?lang=en"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-decoration-none text-dark"
                      >
                        <div className="social-source text-center mt-3">
                          <div className="avatar-xs mx-auto mb-3">

                            <span className={"avatar-title rounded-circle bg-info font-size-16"}>
                             x
                            </span>
                          </div>
                          <h5 className="font-size-15">X</h5>
                          {/* <p className="text-muted mb-0">{social.description} sales</p> */}
                        </div>
                      </a>
                    </Col>
                    <Col xs={4} >
                      <a
                        href="https://www.instagram.com/cityofselma/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-decoration-none text-dark"
                      >
                        <div className="social-source text-center mt-3">
                          <div className="avatar-xs mx-auto mb-3">

                            <span className={"avatar-title rounded-circle bg-pink font-size-16"}>
                              <i className={"mdi mdi-instagram text-white"}></i>
                            </span>
                          </div>
                          <h5 className="font-size-15">Instagram</h5>
                          {/* <p className="text-muted mb-0">{social.description} sales</p> */}
                        </div>
                      </a>
                    </Col>
                    {/* {(socials || [])?.map((social, key) => (
                      <Col xs={4} key={"_li_" + key}>
                        <div className="social-source text-center mt-3">
                          <div className="avatar-xs mx-auto mb-3">

                            <span className={"avatar-title rounded-circle " + social.bgColor + " font-size-16"}>
                              <i className={"mdi " + social.iconClass + " text-white"}></i>
                            </span>
                          </div>
                          <h5 className="font-size-15">{social.title}</h5>
                          <p className="text-muted mb-0">{social.description} sales</p>
                        </div>
                      </Col>
                    ))} */}
                  </Row>
                </CardBody>
              </Card>
            </Col>
            <Col xl="8">
              <Row>

                <Col md="4">
                  <Card className="mini-stats-wid">
                    <CardBody>
                      <div className="d-flex">
                        <div className="flex-grow-1">
                          <p className="text-muted fw-medium">
                            Jobs
                          </p>
                          <h4 className="mb-0">{Homedata?.counts.jobCount}</h4>
                        </div>
                        <div className="avatar-sm rounded-circle bg-primary align-self-center mini-stat-icon">
                          <span className="avatar-title rounded-circle bg-primary">
                            <i className={"bx  bx bx-briefcase-alt font-size-24"}></i>
                          </span>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </Col>

                <Col md="4">
                  <Card className="mini-stats-wid">
                    <CardBody>
                      <div className="d-flex">
                        <div className="flex-grow-1">
                          <p className="text-muted fw-medium">
                            News
                          </p>
                          <h4 className="mb-0">{Homedata?.counts.newsCount}</h4>
                        </div>
                        <div className="avatar-sm rounded-circle bg-primary align-self-center mini-stat-icon">
                          <span className="avatar-title rounded-circle bg-primary">
                            <i className={"bx  bxs-detail font-size-24"}></i>
                          </span>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </Col>

                <Col md="4">
                  <Card className="mini-stats-wid">
                    <CardBody>
                      <div className="d-flex">
                        <div className="flex-grow-1">
                          <p className="text-muted fw-medium">
                            Event
                          </p>
                          <h4 className="mb-0">{Homedata?.counts.eventCount}</h4>
                        </div>
                        <div className="avatar-sm rounded-circle bg-primary align-self-center mini-stat-icon">
                          <span className="avatar-title rounded-circle bg-primary">
                            <i className={"bx  bx-calendar-event font-size-24"}></i>
                          </span>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </Col>

              </Row>

              <Card>
                <CardBody>
                  <div className="d-sm-flex flex-wrap">
                    <h4 className="card-title mb-4">Jobs , Event & News Graph</h4>
                    <div className="container mt-4">
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                          <CartesianGrid vertical={false} horizontal={true} strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="jobs" stackId="a" fill="#556ee6" barSize={7} name="Jobs" />
                          <Bar dataKey="news" stackId="a" fill="#f1b44c" barSize={7} name="News" />
                          <Bar dataKey="events" stackId="a" fill="#34c38f" barSize={7} name="Events" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  {/* <StackedColumnChart periodData={periodData} dataColors='["--bs-primary", "--bs-warning", "--bs-success"]' /> */}
                </CardBody>
              </Card>
            </Col>
          </Row>
          {/* 
          <Row>
            <Col xl="4">
              <SocialSource />
            </Col>
            <Col xl="4">
              <ActivityComp />
            </Col>

            <Col xl="4">
              <TopCities />
            </Col>
          </Row> */}

          <Row>
            <Col lg="6">
              <Card>
                <CardBody>
                  <div className="mb-4 h4 card-title">Latest Events</div>
                  <Table className="table mb-0 table-responsive">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Title</th>
                        <th>Address</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>View Details</th>
                      </tr>
                    </thead>
                    <tbody>

                      {latestevents && latestevents.length > 0 ? (
                        latestevents.map((event, index) => (
                          <tr key={event.id}>
                            <th scope="row">{index + 1}</th>
                            <td>{event.title.length > 20 ? event.title.slice(0, 20) + '...' : event.title}</td>
                            <td>{event.address}</td>
                            <td>{moment(event.date).format("MMM DD, YYYY")}</td>
                            <td>{moment(event.time, "HH:mm:ss").format("hh:mm A")}</td>
                            <td>
                              <Link
                                to={`/event-details/${event.id}`}
                                className="btn btn-sm btn-primary"
                              >
                                View Details
                              </Link>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="text-center">
                            No events found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </CardBody>
              </Card>
            </Col>
            <Col lg="6">
              <Card>
                <CardBody>
                  <div className="mb-4 h4 card-title">Latest News</div>
                  <Table className="table mb-0">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Title</th>
                        <th>Short Description</th>
                        <th>Published</th>
                        <th>View Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {latestnews.length > 0 ? (
                        latestnews.map((news, index) => (
                          <tr key={news.id}>
                            <th scope="row">{index + 1}</th>
                            <td>{news.title.length > 20 ? news.title.slice(0, 20) + '...' : news.title}</td>
                            <td>{news.shortdescription.length > 20 ? news.shortdescription.slice(0, 20) + '...' : news.shortdescription}</td>
                            <td>{moment(news.published_at).format("MMM DD, YYYY")}</td>
                            <td>
                              <Link
                                to={`/news-details/${news.id}`}
                                className="btn btn-sm btn-primary"
                              >
                                View Details
                              </Link>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="text-center">No news found</td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col lg="12">
              <Card>
                <CardBody>
                  <div className="mb-4 h4 card-title">Latest Jobs</div>
                  <Table className="table mb-0">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Title</th>
                        <th>Link</th>
                        <th>Posted On</th>
                        <th>Apply</th>
                        <th>View Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {latestjobs.length > 0 ? (
                        latestjobs.map((job, index) => (
                          <tr key={job.id}>
                            <th scope="row">{index + 1}</th>
                            <td>{job.title.length > 20 ? job.title.slice(0, 20) + '...' : job.title}</td>
                            <td>{job.link}</td>
                            <td>{moment(job.published_at).format("MMM DD, YYYY")}</td>
                            <td>
                              <a href={job.link} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-primary">
                                Apply
                              </a>
                            </td>
                            <td>
                              <Link
                                to={`/job-details/${job.id}`}
                                className="btn btn-sm btn-primary"
                              >
                                View Details
                              </Link>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="text-center">No jobs found</td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      {/* subscribe ModalHeader */}
      {/* <Modal isOpen={subscribeModal} role="dialog" autoFocus={true} centered data-toggle="modal"
        toggle={() => { setSubscribeModal(!subscribeModal); }} >
        <div>
          <ModalHeader className="border-bottom-0" toggle={() => { setSubscribeModal(!subscribeModal); }}></ModalHeader>
        </div>
        <ModalBody>
          <div className="text-center mb-4">
            <div className="avatar-md mx-auto mb-4">
              <div className="avatar-title bg-light  rounded-circle text-primary h1">
                <i className="mdi mdi-email-open"></i>
              </div>
            </div>

            <Row className="justify-content-center">
              <Col xl={10}>
                <h4 className="text-primary">Subscribe !</h4>
                <p className="text-muted font-size-14 mb-4">
                  Subscribe our newletter and get notification to stay update.
                </p>

                <div className="input-group rounded bg-light">
                  <Input type="email" className="form-control bg-transparent border-0" placeholder="Enter Email address" />
                  <Button color="primary" type="button" id="button-addon2">
                    <i className="bx bxs-paper-plane"></i>
                  </Button>
                </div>
              </Col>
            </Row>
          </div>
        </ModalBody>
      </Modal> */}

      <Modal isOpen={modal} role="dialog" autoFocus={true} centered={true} className="exampleModal" tabIndex="-1"
        toggle={() => { setModal(!modal); }}>
        <div>
          <ModalHeader toggle={() => { setModal(!modal); }}> Order Details</ModalHeader>
          <ModalBody>
            <p className="mb-2">
              Product id: <span className="text-primary">#SK2540</span>
            </p>
            <p className="mb-4">
              Billing Name: <span className="text-primary">Neal Matthews</span>
            </p>

            <div className="table-responsive">
              <Table className="table table-centered table-nowrap">
                <thead>
                  <tr>
                    <th scope="col">Product</th>
                    <th scope="col">Product Name</th>
                    <th scope="col">Price</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">
                      <div>
                        <img src={modalimage1} alt="" className="avatar-sm" />
                      </div>
                    </th>
                    <td>
                      <div>
                        <h5 className="text-truncate font-size-14">
                          Wireless Headphone (Black)
                        </h5>
                        <p className="text-muted mb-0">$ 225 x 1</p>
                      </div>
                    </td>
                    <td>$ 255</td>
                  </tr>
                  <tr>
                    <th scope="row">
                      <div>
                        <img src={modalimage2} alt="" className="avatar-sm" />
                      </div>
                    </th>
                    <td>
                      <div>
                        <h5 className="text-truncate font-size-14">
                          Hoodie (Blue)
                        </h5>
                        <p className="text-muted mb-0">$ 145 x 1</p>
                      </div>
                    </td>
                    <td>$ 145</td>
                  </tr>
                  <tr>
                    <td colSpan="2">
                      <h6 className="m-0 text-end">Sub Total:</h6>
                    </td>
                    <td>$ 400</td>
                  </tr>
                  <tr>
                    <td colSpan="2">
                      <h6 className="m-0 text-end">Shipping:</h6>
                    </td>
                    <td>Free</td>
                  </tr>
                  <tr>
                    <td colSpan="2">
                      <h6 className="m-0 text-end">Total:</h6>
                    </td>
                    <td>$ 400</td>
                  </tr>
                </tbody>
              </Table>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button type="button" color="secondary" onClick={() => { setModal(!modal); }}>
              Close
            </Button>
          </ModalFooter>
        </div>
      </Modal>
    </React.Fragment>
  );
};

Dashboard.propTypes = {
  t: PropTypes.any,
  chartsData: PropTypes.any,
  onGetChartsData: PropTypes.func,
};

export default withTranslation()(Dashboard);
