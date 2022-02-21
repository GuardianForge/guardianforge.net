import React from 'react'
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// @ts-ignore
import SiteLogo from "../../images/site-logo.png"
import { Link } from "gatsby"
import UserMenu from './UserMenu'
import { Container, Navbar, Nav, NavDropdown } from 'react-bootstrap'
import colors from '../../colors'

const Wrapper = styled(Navbar)`
  background-color: ${colors.theme2.bg} !important;
  border-bottom: 1px solid ${colors.theme2.dark1};
`

function MainNav() {
  return (
    <Wrapper collapseOnSelect expand="lg" variant="dark">
      <Container fluid>
        <Nav.Link as="div" href="#" style={{ padding: "0" }}>
          <Link className="navbar-brand" to="/">
            <img src={SiteLogo} alt="GuardianForge Logo" height="40" width="40" /> GuardianForge
          </Link>
        </Nav.Link>
        <Navbar.Toggle aria-controls="responsive-navnav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto" as="ul">
            <Nav.Link as="li" href="#" style={{ padding: "0" }}>
              <Link className="nav-link" to="/find-players">
                <FontAwesomeIcon icon="user" /> Find Players
              </Link>
            </Nav.Link>
            <Nav.Link as="li" href="#">
              <Link className="nav-link" to="/find-builds" style={{ padding: "0" }}>
                <FontAwesomeIcon icon="cube" /> Find Builds
              </Link>
            </Nav.Link>
          </Nav>
          <Nav>
            <UserMenu />
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Wrapper>
  )
}

export default MainNav
