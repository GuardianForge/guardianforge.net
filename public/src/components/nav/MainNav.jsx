import React from 'react'
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import SiteLogo from "../../images/site-logo.png"
import { Link } from "gatsby"
import UserMenu from './UserMenu'
import { Container, Navbar, Nav, NavDropdown } from 'react-bootstrap'

// const Nav = styled.nav`
//   width: 100%;
//   background-color: #14151A !important;
//   border-bottom: 1px solid #333;
// `

const style = {
  backgroundColor: "#14151A !important",
  borderBottom: "1px solid #333"
}

function MainNav() {
  return (
    <Navbar style={style} collapseOnSelect expand="lg" bg="dark" variant="dark">
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
    </Navbar>

    // <Navbar style={style} collapseOnSelect expand="lg" variant="dark">
    //   <Container>
    //     <Link className="navbar-brand" to="/">
    //       <img src={SiteLogo} alt="GuardianForge Logo" height="40" width="40" /> GuardianForge
    //     </Link>
    //     <Navbar.Toggle aria-controls="responsive-navbar-nav" />
    //     <Navbar.Collapse id="responsive-navbar-nav">
    //       <Nav className="me-auto">
    //         <Nav.Link as="li">
    //           <Link className="nav-link" to="/find-players">
    //             <FontAwesomeIcon icon="user" /> Find Players
    //           </Link>
    //         </Nav.Link>
    //         <Nav.Link as="li">
    //           <Link className="nav-link" to="/find-builds">
    //             <FontAwesomeIcon icon="cube" /> Find Builds
    //           </Link>
    //         </Nav.Link>
    //       </Nav>
    //       <Nav>
    //         <UserMenu />
    //       </Nav>
    //     </Navbar.Collapse>
    //   </Container>
    // </Navbar>

    // <Nav className="navbar navbar-expand-lg navbar-dark bg-dark">
    //   <div className="container-fluid">
    //     <Link className="navbar-brand" to="/">
    //       <img src={SiteLogo} alt="GuardianForge Logo" height="40" width="40" /> GuardianForge
    //     </Link>
    //     {/* <!-- <span class="navbar-brand">GuardianForge (beta)</span> --> */}
    //     <button className="navbar-toggler"
    //       type="button"
    //       data-bs-toggle="collapse"
    //       data-bs-target="#navbarSupportedContent"
    //       aria-controls="navbarSupportedContent"
    //       aria-expanded="false"
    //       aria-label="Toggle navigation">
    //       <span className="navbar-toggler-icon"></span>
    //     </button>
    //     <div className="collapse navbar-collapse" id="navbarSupportedContent">
    //       <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            // <li className="nav-item">
            //   <Link className="nav-link" to="/find-players">
            //     <FontAwesomeIcon icon="user" /> Find Players
            //   </Link>
            // </li>
            // <li className="nav-item">
            //   <Link className="nav-link" to="/find-builds">
            //     <FontAwesomeIcon icon="cube" /> Find Builds
            //   </Link>
            // </li>
    //       </ul>
    //       <UserMenu />
    //     </div>
    //   </div>
    // </Nav>
  )
}

export default MainNav
