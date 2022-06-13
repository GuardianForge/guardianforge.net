import React, { ReactNode } from "react"
import { Link, useStaticQuery, graphql } from "gatsby"
import { BaseLayout, colors, Footer, ForgeNav } from "shared"
import { Badge, Container, Nav } from 'react-bootstrap'
import SiteLogo from '../images/site-logo.png'
import { createGlobalStyle } from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons"
import Home from "../pages/home"
import DocsNav from "./DocsNav"

const GlobalStyle = createGlobalStyle`
  #forge-nav {
    margin-bottom: 20px;
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
      <Container style={{maxWidth: "800px"}}>
        <DocsNav />
        <main>{children}</main>
        <Footer linkComponent={Link} />
      </Container>
    </BaseLayout>
  )
}

export default Layout
