import React, { ReactNode } from "react"
import { Link, useStaticQuery, graphql } from "gatsby"
import { BaseLayout, colors, Footer, ForgeNav, AppTypeEnum } from "shared"
import { Badge, Col, Container, Nav, Row } from 'react-bootstrap'
import SiteLogo from '../images/site-logo.png'
import styled, { createGlobalStyle } from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons"
import Home from "../pages/home"
import DocsNav from "./DocsNav"

const GlobalStyle = createGlobalStyle`
  #forge-nav {
    margin-bottom: 20px;
  }
`

const Wrapper = styled(Container)`
  .content {
    flex: 1;
    margin: 0px 10px;

    img {
      max-width: 100%;
      height: auto;
      border: 1px solid ${colors.theme2.dark1};
      border-radius: 5px;
      margin: 5px 0px;
    }
  }
`

type Props = {
  children: ReactNode
  className?: string
}

const Layout = (props: Props) => {
  const { className, children } = props
  const {
    wp: {
      generalSettings: { title },
    },
  } = useStaticQuery(graphql`
    query LayoutQuery {
      wp {
        generalSettings {
          title
          description
        }
      }
    }
  `)

  return (
    <BaseLayout className={className}>
      <GlobalStyle />
      <ForgeNav branding={
        <Link className="navbar-brand" to="/">
          <img src={SiteLogo} alt="GuardianForge Logo" height="40" width="40" /> GuardianForge <Badge bg="white" style={{color: colors.theme2.dark2}}>Docs</Badge>
        </Link>}>
        <Nav.Link href="/">
          <FontAwesomeIcon icon={faArrowLeft} /> Back Home
        </Nav.Link>
      </ForgeNav>
      <Wrapper>
        <Row className="nav-wrapper">
          <Col md={3}>
            <DocsNav />
          </Col>
          <Col md={9} className="content">
            {children}
          </Col>
        </Row>
      </Wrapper>
      <Footer appType={AppTypeEnum.Docs} linkComponent={Link} />
    </BaseLayout>
  )
}

export default Layout
