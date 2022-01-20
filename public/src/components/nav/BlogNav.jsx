import React from 'react'
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import SiteLogo from "../../images/site-logo.png"
import { Link } from "gatsby"

const Wrapper = styled.nav`
  width: 100%;
  background-color: #14151A !important;
  border-bottom: 1px solid #333;


  .badge {
    margin-left: -7px;
    margin-right: 5px;
  }

  .navbar-brand {
    min-height: 50px !important;
  }
`

function BlogNav() {
  return (
    <Wrapper className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          <img src={SiteLogo} alt="GuardianForge Logo" height="40" width="40" /> GuardianForge
        </Link>
        <div className="badge bg-light text-dark">Blog</div>
        <button className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <a className="nav-link" to="/blog">
                <FontAwesomeIcon icon="pen-square" /> Docs
              </a>
            </li>
          </ul>
          {/* <UserMenu /> */}
        </div>
      </div>
    </Wrapper>
  )
}

export default BlogNav
