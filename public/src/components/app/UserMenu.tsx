import { Link } from 'gatsby'
import React, { useContext, useEffect, useState } from 'react'
// @ts-ignore
import { GlobalContext } from '../../contexts/GlobalContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import styled from 'styled-components'
import User from '../../models/User'
import colors from "../../colors"
import { faUserGraduate } from '@fortawesome/free-solid-svg-icons'

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  margin-right: 10px;
  /* background-color: ${colors.theme2.dark2}; */
  border-radius: 5px;
  padding: 0px 10px;
  transition: background-color .15s;

  &:hover {
    background-color: ${colors.theme2.dark2}
  }

  .dropdown-toggle {
    color: ${colors.theme2.text} !important;

    &:hover {
      color: ${colors.theme2.text} !important;
      cursor: pointer;
    }

    &:active {
      color: ${colors.theme2.text} !important;
    }
  }

  .display-name {
    /* color: ${colors.theme2.icon} !important; */
  }

  .dropdown-toggle::after {
    /* color: ${colors.theme2.icon} !important; */
  }

  .dropdown-menu {
    background-color: ${colors.theme2.dark2};
    box-shadow: 5px 5px 5px rgba(0,0,0,0.1);
  }

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
  const [userData, setUserData] = useState<User>({})
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if(!isClientLoaded) return
    function init() {
      let { ForgeClient } = window.services
      if(ForgeClient.config && ForgeClient.config.loginUrl) {
        setLoginUrl(ForgeClient.config.loginUrl)
      }

      if(ForgeClient.isLoggedIn()) {
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
          <li className="nav-item dropdown">
            <a className="nav-link dropdown-toggle user-badge" href="#" id="navbarDarkDropdownMenuLink" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              {userData.bungieNetUser && userData.bungieNetUser.profilePicturePath && (
                <img src={`https://www.bungie.net${userData.bungieNetUser.profilePicturePath}`} />
              )}
              {userData.bungieNetUser && userData.bungieNetUser.displayName && (
                <span className="display-name">{ userData.bungieNetUser.displayName }</span>
              )}
            </a>
            <ul className="dropdown-menu dropdown-menu-end dropdown-menu-dark" aria-labelledby="navbarDarkDropdownMenuLink">
              {userData && userData.bungieNetUser && (
                <li>
                  <Link className="dropdown-item" to={`/app/u/${userData.bungieNetUser.uniqueName}`}>My Profile</Link>
                </li>
              )}
              <li>
                <Link className="dropdown-item" to="/app/edit-profile">Edit Profile</Link>
              </li>
              <li>
                <Link className="dropdown-item" to="/">👈  Back to the Old Forge</Link>
              </li>
              <li>
                <a className="dropdown-item" href="#" onClick={logout}>Log Out</a>
              </li>
              {isAdmin && <hr />}
              {isAdmin && (
                <li>
                  <Link className="dropdown-item" to="/admin/admin-tools">Admin</Link>
                </li>
              )}
            </ul>
          </li>
        ) : (
          <li className="nav-item">
            <a className="nav-link" href={loginUrl}>
              <FontAwesomeIcon icon="sign-in-alt" /> Login w/Bungie
            </a>
          </li>
        )}
      </ul>
    </Wrapper>
  )
}

export default UserMenu
