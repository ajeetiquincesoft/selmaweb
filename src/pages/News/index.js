import React from "react"
import { Container, Row } from "reactstrap"

//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb"

import NewsList from "./NewsList"


const Index = () => {
    //meta title
    document.title="News | City of Selma";
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          {/* <Breadcrumbs title="Blog" breadcrumbItem="Blog List" /> */}
          <Row>
            <NewsList />
          </Row>
        </Container>
      </div>
    </React.Fragment>
  )
}

export default Index
