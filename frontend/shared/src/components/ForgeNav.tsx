import React, { ReactNode } from 'react'
import styled from 'styled-components'
import { Container, Navbar, Nav } from 'react-bootstrap'
import colors from '../colors'

const Wrapper = styled(Navbar)`
  background-color: ${colors.theme2.bg} !important;
  border-bottom: 1px solid ${colors.theme2.dark1};
`

export interface Props {
  branding?: ReactNode
  children: ReactNode
  right?: ReactNode
}

function ForgeNav(props: Props) {
  const { branding, children, right } = props

  return (
    <Wrapper collapseOnSelect expand="lg" variant="dark" id="forge-nav">
      <Container fluid>
        {branding !== undefined && (
          <Nav.Link as="div" href="#" style={{ padding: "0" }}>
            { branding }
          </Nav.Link>
        )}
        <Navbar.Toggle aria-controls="responsive-navnav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto" as="ul">
            { children }
          </Nav>
          {right !== undefined && (
            <Nav>
              { right }
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Wrapper>
  )
}

export default ForgeNav
