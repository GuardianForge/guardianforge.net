import { useContext, useState, useEffect } from 'react'
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// @ts-ignore
import SiteLogo from "../../images/site-logo.png"
import { Link } from "react-router-dom"
import { Container, Navbar, Nav } from 'react-bootstrap'
import colors from '../../colors'
import { faCube, faSignInAlt, faUser } from '@fortawesome/free-solid-svg-icons'
import { GlobalContext } from '../../contexts/GlobalContext'

const Wrapper = styled(Navbar)`
  background-color: ${colors.theme2.bg} !important;
  border-bottom: 1px solid ${colors.theme2.dark1};
`

function MainNav() {
  const { isClientLoaded } = useContext(GlobalContext)
  const [loginUrl, setLoginUrl] = useState("")

  useEffect(() => {
    if(!isClientLoaded) return
    function init() {
      let { ForgeClient } = window.services
      if(ForgeClient.config && ForgeClient.config.loginUrl) {
        setLoginUrl(ForgeClient.config.loginUrl)
      }
    }
    init()
  }, [isClientLoaded])

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
                <FontAwesomeIcon icon={faUser} /> Find Players
              </Link>
            </Nav.Link>
            <Nav.Link as="li" href="#">
              <Link className="nav-link" to="/find-builds" style={{ padding: "0" }}>
                <FontAwesomeIcon icon={faCube} /> Find Builds
              </Link>
            </Nav.Link>
          </Nav>
          <Nav>

            <li className="nav-item">
              <a className="nav-link" href={loginUrl}>
                <FontAwesomeIcon icon={faSignInAlt} /> Login w/Bungie
              </a>
            </li>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Wrapper>
  )
}

export default MainNav
