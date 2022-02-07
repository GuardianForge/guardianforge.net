import { Link, navigate } from 'gatsby'
import React, { useContext, useEffect, useState } from 'react'
// @ts-ignore
import { GlobalContext } from '../../contexts/GlobalContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import styled from 'styled-components'
import User from '../../models/User'
import colors from "../../colors"
import { faUserGraduate } from '@fortawesome/free-solid-svg-icons'
import ForgeButton from './forms/Button'
import ForgeModal from './Modal'
import { Button } from 'react-bootstrap'

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  margin-right: 10px;
  background-color: ${colors.theme2.dark2};
  border-radius: 5px;
  margin-left: 5px;
  transition: background-color .15s;
  margin-bottom: 10px;

  ul, a {
    margin-bottom: 0px !important;
  }

  .nav-link {
    margin-bottom: 0px;
  }

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
    color: ${colors.theme2.text} !important;
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
    margin-left: 10px;
    margin-right: 15px;
    border-radius: 5px;
  }

  span {
    font-weight: 1.5rem;
  }
`

const SelectItemButton = styled(Button)`
  width: 100%;
  background-color: ${colors.theme2.dark2} !important;
  border: none !important;
  display: flex !important;
  align-items: center;
  justify-content: start;
  margin-bottom: 10px;

  &:hover {
    background-color: ${colors.theme2.dark3} !important;
  }

  img {
    width: 50px;
    height: 50px;
    margin-right: 10px;
  }
`

type Props = {
  onMenuItemClicked?: Function
}

function UserMenuMobile(props: Props) {
  const { onMenuItemClicked} = props

  const { isClientLoaded, didOAuthComplete } = useContext(GlobalContext)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loginUrl, setLoginUrl] = useState("")
  const [userData, setUserData] = useState<User>({})
  const [isAdmin, setIsAdmin] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

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

  function navigateTo(to: string) {
    navigate(to)
    setIsUserMenuOpen(false)

    if(onMenuItemClicked) onMenuItemClicked()
  }

  return (
    <Wrapper className="d-flex">
      <ul className="navbar-nav me-auto mb-2 mb-lg-0">
        {isLoggedIn ? (
          <li className="nav-item dropdown">
            <a className="nav-link user-badge" href="#" onClick={() => setIsUserMenuOpen(true)}>
              {userData.bungieNetUser && userData.bungieNetUser.profilePicturePath && (
                <img src={`https://www.bungie.net${userData.bungieNetUser.profilePicturePath}`} />
              )}
              {userData.bungieNetUser && userData.bungieNetUser.displayName && (
                <span className="display-name">{ userData.bungieNetUser.displayName }</span>
              )}
            </a>
          </li>
        ) : (
          <li className="nav-item">
            <a className="nav-link" href={loginUrl}>
              <FontAwesomeIcon icon="sign-in-alt" /> Login w/Bungie
            </a>
          </li>
        )}
      </ul>


      <ForgeModal
        show={isUserMenuOpen}
        title="User Menu"
        footer={<ForgeButton onClick={() => setIsUserMenuOpen(false)}>Close</ForgeButton>}>
        {userData && userData.bungieNetUser && (
          <SelectItemButton className="class-option" onClick={() => navigateTo(`/app/u/${userData?.bungieNetUser?.uniqueName}`)}>
            My Profile
          </SelectItemButton>
        )}
        <SelectItemButton className="class-option" onClick={() => navigateTo("/app/edit-profile")}>
          Edit Profile
        </SelectItemButton>
        <SelectItemButton className="class-option" onClick={() => navigateTo("/")}>
          👈  Back to the Old Forge
        </SelectItemButton>
        <SelectItemButton className="class-option" onClick={logout}>
          Log Out
        </SelectItemButton>
        {isAdmin && <hr />}
        {isAdmin && (
          <SelectItemButton className="class-option" onClick={() => navigateTo("/admin/admin-tools")}>
            Admin
          </SelectItemButton>
        )}
      </ForgeModal>
    </Wrapper>
  )
}

export default UserMenuMobile
