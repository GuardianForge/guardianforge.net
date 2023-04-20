import { Link, useNavigate } from 'react-router-dom'
import { useContext, useEffect, useState } from 'react'
import { GlobalContext } from '../contexts/GlobalContext'
import styled from 'styled-components'
import User from '../models/User'
import colors from "../colors"
import { Button, Dropdown } from 'react-bootstrap'
import ForgeModal from './Modal'
import ForgeButton from './forms/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Image from './ui/Image'

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  margin-right: 10px;
  border-radius: 5px;
  transition: background-color .15s;

  &:hover {
    background-color: ${colors.theme2.dark2}
  }

  /* This is when the menu is clicked */
  .show>.btn-primary.dropdown-toggle {
    background-color: ${colors.theme2.dark2};
  }

  .dropdown-toggle {
    color: ${colors.theme2.text} !important;
    background-color: rgba(0,0,0,0);
    border: none !important;

    &:hover {
      color: ${colors.theme2.text} !important;
      cursor: pointer;
    }

    &:active {
      color: ${colors.theme2.text} !important;
    }
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

  .dropdown-item {
    color: ${colors.theme2.text};

    &:hover {
      background-color: ${colors.theme2.dark3};
    }
  }
`

const MobileWrapper = styled.div`
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
  isMobile?: boolean
  onMenuItemClicked?: Function
}

function UserMenu(props: Props) {
  const { isMobile, onMenuItemClicked } = props
  const navigate = useNavigate()
  const { isClientLoaded, didOAuthComplete, isLoggedIn } = useContext(GlobalContext)
  const [userData, setUserData] = useState<User>({})

  const [displayName, setDisplayName] = useState("")
  const [iconUrl, setIconUrl] = useState("")
  const [isAdmin, setIsAdmin] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  useEffect(() => {
    if(!isClientLoaded) return
    if(!isLoggedIn) return
    function init() {
      let { ForgeClient } = window.services
      if(ForgeClient.userData) {
        setUserData(ForgeClient.userData)
        if(ForgeClient.userData.bungieNetUser && ForgeClient.userData.bungieNetUser.membershipId === "14214042") {
          setIsAdmin(true)
        }
      }
    }
    init()
  }, [isClientLoaded])

  useEffect(() => {
    if(userData?.bungieNetUser?.displayName) {
      setDisplayName(userData.bungieNetUser.displayName)
    }

    if(userData?.bungieNetUser?.profilePicturePath) {
      setIconUrl(`https://www.bungie.net${userData.bungieNetUser.profilePicturePath}`)
    }
  }, [userData])

  useEffect(() => {
    if(!didOAuthComplete || !isClientLoaded || !isLoggedIn) return
    function init() {
      let { ForgeClient } = window.services
      setUserData(ForgeClient.userData)
    }
    init()
  }, [didOAuthComplete, isClientLoaded])

  function navigateTo(to: string) {
    navigate(to)
    setIsUserMenuOpen(false)

    if(onMenuItemClicked) onMenuItemClicked()
  }

  function logout() {
    const { ForgeClient } = window.services
    ForgeClient.logout()
  }

  if(isMobile) {
    return (
      <MobileWrapper className="d-flex">
        <ul className="navbar-nav me-auto mb-2 mb-lg-0" style={{width: "100%"}}>
          <li className="nav-item dropdown">
            <a className="nav-link user-badge" href="#" onClick={() => setIsUserMenuOpen(true)}>
              {iconUrl && <Image src={iconUrl} />}
              {displayName && <span className="display-name">{ displayName }</span>}
            </a>
          </li>
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
          <SelectItemButton className="class-option" onClick={logout}>
            Log Out
          </SelectItemButton>
          {isAdmin && <hr />}
          {isAdmin && (
            <SelectItemButton className="class-option" onClick={() => navigateTo("/app/admin/admin-tools")}>
              Admin
            </SelectItemButton>
          )}
        </ForgeModal>
      </MobileWrapper>
    )
  } else {
    return (
      <Wrapper className="d-flex">
        <Dropdown align="end">
          <Dropdown.Toggle className="user-badge flex items-center">
            {userData && userData.bungieNetUser && (
              <>
                <img src={`https://www.bungie.net${userData.bungieNetUser.profilePicturePath}`} alt="User Profile Img" />
                <span>{ userData.bungieNetUser.displayName }</span>
              </>
            )}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {userData && userData.bungieNetUser && (
              <Dropdown.Item>
                <a className="dropdown-item" onClick={() => navigateTo(`/app/u/${userData?.bungieNetUser?.uniqueName}`)}>My Profile</a>
              </Dropdown.Item>
            )}
            <Dropdown.Item>
              <Link className="dropdown-item" to="/app/edit-profile">Edit Profile</Link>
            </Dropdown.Item>
            <Dropdown.Item>
              <a className="dropdown-item" href="#" onClick={logout}>Log Out</a>
            </Dropdown.Item>
            {isAdmin && (
              <>
                <hr />
                <Dropdown.Item>
                  <Link className="dropdown-item" to="/app/admin/admin-tools">Admin</Link>
                </Dropdown.Item>
              </>
            )}
          </Dropdown.Menu>
        </Dropdown>
      </Wrapper>
    )
  }

}

export default UserMenu
