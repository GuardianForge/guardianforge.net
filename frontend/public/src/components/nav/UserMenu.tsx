import { Link } from 'react-router-dom'
import React, { useContext, useEffect, useState } from 'react'
import { GlobalContext } from '../../contexts/GlobalContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import styled from 'styled-components'
import { faSignInAlt } from '@fortawesome/free-solid-svg-icons'
import { Dropdown, NavDropdown } from 'react-bootstrap'

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  margin-right: 10px;

  img {
    max-width: 20px;
    margin-right: 5px;
    border-radius: 5px;
  }

  span {
    font-weight: 1.5rem;
  }
`

function UserMenu() {
  const { isClientLoaded, didOAuthComplete } = useContext(GlobalContext)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loginUrl, setLoginUrl] = useState("")
  const [userData, setUserData] = useState<any>({})
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if(!isClientLoaded) return
    function init() {
      let { ForgeClient } = window.services
      if(ForgeClient.config && ForgeClient.config.loginUrl) {
        setLoginUrl(ForgeClient.config.loginUrl)
      }

      console.log(ForgeClient.userData)

      if(ForgeClient.isLoggedIn() && ForgeClient.userData) {
        setUserData(ForgeClient.userData)
        setIsLoggedIn(true)

        if(ForgeClient.userData.bungieNetUser && ForgeClient.userData.bungieNetUser.membershipId === "14214042") {
          setIsAdmin(true)
        }
      }
    }
    init()
  }, [isClientLoaded])

  useEffect(() => {
    if(!didOAuthComplete || !isClientLoaded) return
    function init() {
      let { ForgeClient } = window.services
      if(ForgeClient.config && ForgeClient.config.loginUrl) {
        setLoginUrl(ForgeClient.config.loginUrl)
      }

      if(ForgeClient.isLoggedIn()) {
        setUserData(ForgeClient.userData)
        setIsLoggedIn(true)
      }
    }
    init()
  }, [didOAuthComplete, isClientLoaded])

  function logout() {
    const { ForgeClient } = window.services
    ForgeClient.logout()
  }

  return (
    <Wrapper className="d-flex">
      <ul className="navbar-nav me-auto mb-2 mb-lg-0">
        {isLoggedIn ? (
          <Dropdown align="end">
            <Dropdown.Toggle className="dropdown-toggle user-badge">
              {userData && userData.bungieNetUser && (
                <>
                  <img src={`https://www.bungie.net${userData.bungieNetUser.profilePicturePath}`} alt="User Profile Img" />
                  <span>{ userData.bungieNetUser.displayName }</span>
                </>
              )}
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item>
                <Link className="dropdown-item" to="/app/me">Profile</Link>
              </Dropdown.Item>
              <Dropdown.Item>
                <Link className="dropdown-item" to="/app">My Guardians</Link>
              </Dropdown.Item>
              <Dropdown.Item>
                <Link className="dropdown-item" to="/app/my-builds">My Builds</Link>
              </Dropdown.Item>
              <Dropdown.Item>
                <Link className="dropdown-item" to="/app/bookmarks">Bookmarked Builds</Link>
              </Dropdown.Item>
              <Dropdown.Item>
                <a className="dropdown-item" href="#" onClick={logout}>Log Out</a>
              </Dropdown.Item>
              {isAdmin && (
                <>
                  <hr />
                  <Dropdown.Item>
                    <Link className="dropdown-item" to="/admin/admin-tools">Admin</Link>
                  </Dropdown.Item>
                </>
              )}
            </Dropdown.Menu>
          </Dropdown>
        ) : (
          <li className="nav-item">
            <a className="nav-link" href={loginUrl}>
              <FontAwesomeIcon icon={faSignInAlt} /> Login w/Bungie
            </a>
          </li>
        )}
      </ul>
    </Wrapper>
  )
}

export default UserMenu
