import React, { useState } from "react"
import { Link } from "react-router-dom"
import {
  Card,
  Col,
  Nav,
  NavItem,
  NavLink,
  Row,
  TabContent,
  TabPane,
} from "reactstrap"

import classnames from "classnames"

//import images
import small from "../../assets/images/small/img-2.jpg"
import small2 from "../../assets/images/small/img-6.jpg"

const NewsList = () => {
  const [activeTab, toggleTab] = useState("1");

  return (
 <>
      <Col xl={12} lg={12}>
        <Card>
          <TabContent className="p-4" activeTab={activeTab}>
            <TabPane tabId="1">
              <div>
                <Row className="justify-content-center">
                  <Col xl={8}>
                    <div>
                      <hr className="mb-4" />
                      <div>
                        <h5>
                          <Link to="/blog-details" className="text-dark">
                            Beautiful Day with Friends
                          </Link>
                        </h5>
                        <p className="text-muted">10 Apr, 2020</p>

                        <div className="position-relative mb-3">
                          <img src={small} alt="" className="img-thumbnail" />
                        </div>

                        <ul className="list-inline">
                          <li className="list-inline-item mr-3">
                            <Link to="#" className="text-muted">
                              <i className="bx bx-purchase-tag-alt align-middle text-muted me-1"></i>{" "}
                              Project
                            </Link>
                          </li>
                          <li className="list-inline-item mr-3">
                            <Link to="#" className="text-muted">
                              <i className="bx bx-comment-dots align-middle text-muted me-1"></i>{" "}
                              12 Comments
                            </Link>
                          </li>
                        </ul>
                        <p>
                          Neque porro quisquam est, qui dolorem ipsum quia dolor
                          sit amet, consectetur, adipisci velit, aliquam quaerat
                          voluptatem. Ut enim ad minima veniam, quis
                        </p>

                        <div>
                          <Link to="#" className="text-primary">
                            Read more <i className="mdi mdi-arrow-right"></i>
                          </Link>
                        </div>
                      </div>
                      <hr className="my-5" />
                      <div>
                        <h5>
                          <Link to="/blog-details" className="text-dark">
                            Project discussion with team
                          </Link>
                        </h5>
                        <p className="text-muted">24 Mar, 2020</p>

                        <div className="position-relative mb-3">
                          <img src={small2} alt="" className="img-thumbnail" />

                          <div className="blog-play-icon">
                            <Link to="#" className="avatar-sm d-block mx-auto">
                              <span className="avatar-title rounded-circle font-size-18">
                                <i className="mdi mdi-play"></i>
                              </span>
                            </Link>
                          </div>
                        </div>

                        <ul className="list-inline">
                          <li className="list-inline-item mr-3">
                            <Link to="#" className="text-muted">
                              <i className="bx bx-purchase-tag-alt align-middle text-muted ms-1"></i>{" "}
                              Development
                            </Link>
                          </li>
                          <li className="list-inline-item mr-3">
                            <Link to="#" className="text-muted">
                              <i className="bx bx-comment-dots align-middle text-muted ms-1"></i>{" "}
                              08 Comments
                            </Link>
                          </li>
                        </ul>

                        <p>
                          At vero eos et accusamus et iusto odio dignissimos
                          ducimus qui blanditiis praesentium voluptatum deleniti
                          atque corrupti quos dolores similique sunt in culpa
                          qui officia deserunt mollitia animi est
                        </p>

                        <div>
                          <Link to="#" className="text-primary">
                            Read more <i className="mdi mdi-arrow-right"></i>
                          </Link>
                        </div>
                      </div>
                      <hr className="my-5" />
                      <div className="text-center">
                        <ul className="pagination justify-content-center pagination-rounded">
                          <li className="page-item disabled">
                            <Link to="#" className="page-link">
                              <i className="mdi mdi-chevron-left"></i>
                            </Link>
                          </li>
                          <li className="page-item">
                            <Link to="#" className="page-link">
                              1
                            </Link>
                          </li>
                          <li className="page-item active">
                            <Link to="#" className="page-link">
                              2
                            </Link>
                          </li>
                          <li className="page-item">
                            <Link to="#" className="page-link">
                              3
                            </Link>
                          </li>
                          <li className="page-item">
                            <Link to="#" className="page-link">
                              ...
                            </Link>
                          </li>
                          <li className="page-item">
                            <Link to="#" className="page-link">
                              10
                            </Link>
                          </li>
                          <li className="page-item">
                            <Link to="#" className="page-link">
                              <i className="mdi mdi-chevron-right"></i>
                            </Link>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>
            </TabPane>
          </TabContent>
        </Card>
      </Col>
    </>
  )
}

export default NewsList;