import { Link } from 'gatsby'
import React, { useContext, useEffect, useState } from 'react'
import { GlobalContext } from '../../contexts/GlobalContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import styled from 'styled-components'

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
  const [userData, setUserData] = useState({})
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if(!isClientLoaded) return
    function init() {
      let { ForgeClient } = window.services
      setLoginUrl(ForgeClient.config.loginUrl)

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
      setLoginUrl(ForgeClient.config.loginUrl)

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
              <img src={`https://www.bungie.net${userData.bungieNetUser.profilePicturePath}`} />
              <span>{ userData.bungieNetUser.displayName }</span>
            </a>
            <ul className="dropdown-menu dropdown-menu-end dropdown-menu-dark" aria-labelledby="navbarDarkDropdownMenuLink">
              <li>
                <Link className="dropdown-item" to="/me">Profile</Link>
              </li>
              <li>
                <Link className="dropdown-item" to="/me/guardians">My Guardians</Link>
              </li>
              <li>
                <Link className="dropdown-item" to="/me/builds">My Builds</Link>
              </li>
              <li>
                <Link className="dropdown-item" to="/me/bookmarks">Bookmarked Builds</Link>
              </li>
              <li>
                <Link className="dropdown-item" to="/me/private-builds">Private Builds</Link>
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
