import { Link, useNavigate } from 'react-router-dom'
import { useContext, useEffect, useState } from 'react'
import { GlobalContext } from '../contexts/GlobalContext'
import styled from 'styled-components'
import User from '../models/User'
import colors from "../colors"
import { Button, Dropdown } from 'react-bootstrap'
import ForgeModal from './Modal'
import ForgeButton from './forms/Button'
import Image from './ui/Image'
import Loading from './Loading'

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
  const { isClientLoaded, didOAuthComplete, isUserDataLoaded } = useContext(GlobalContext)
  const [userData, setUserData] = useState<User>({})
  const [displayName, setDisplayName] = useState("")
  const [iconUrl, setIconUrl] = useState("")
  const [isAdmin, setIsAdmin] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  useEffect(() => {
    if(!isClientLoaded) return
    function init() {
      let { ForgeClient } = window.services
      if(ForgeClient.isLoggedIn() && ForgeClient.userData) {
        console.log("hit")
        setUserData(ForgeClient.userData)
        if(ForgeClient.userData.bungieNetUser && ForgeClient.userData.bungieNetUser.membershipId === "14214042") {
          setIsAdmin(true)
        }
      }
    }
    init()
  }, [isClientLoaded, isUserDataLoaded])

  useEffect(() => {
    if(!didOAuthComplete || !isClientLoaded) return
    function init() {
      let { ForgeClient } = window.services
      if(ForgeClient.isLoggedIn()) {
        setUserData(ForgeClient.userData)
      }
    }
    init()
  }, [didOAuthComplete, isClientLoaded])

  useEffect(() => {
    if(userData?.bungieNetUser?.displayName) {
      setDisplayName(userData.bungieNetUser.displayName)
    }

    if(userData?.bungieNetUser?.profilePicturePath) {
      setIconUrl(`https://www.bungie.net${userData.bungieNetUser.profilePicturePath}`)
    }
  }, [userData])

  function navigateTo(to: string) {
    navigate(to)
    setIsUserMenuOpen(false)

    if(onMenuItemClicked) onMenuItemClicked()
  }

  function logout() {
    const { ForgeClient } = window.services
    ForgeClient.logout()
  }

  return (
    <div className="d-flex">
      <Dropdown align="end">
        <Dropdown.Toggle className="user-badge flex gap-1 items-center rounded-none border-none bg-inherit hover:bg-neutral-800">
          {!iconUrl && !displayName && <Loading small />}
          {iconUrl && <Image className='h-[20px] w-[20px] border-neutral-600' src={iconUrl} />}
          {displayName && <span className="display-name">{ displayName }</span>}
        </Dropdown.Toggle>
        <Dropdown.Menu className='bg-neutral-800 rounded-none border-neutral-600'>
          {userData && userData.bungieNetUser && (
            <Dropdown.Item className='hover:bg-neutral-600'>
              <a className="text-white hover:text-white" href="#"
                onClick={() => navigateTo(`/u/${userData?.bungieNetUser?.uniqueName}`)}>My Profile</a>
            </Dropdown.Item>
          )}
          <Dropdown.Item className='hover:bg-neutral-600'>
            <Link className="text-white hover:text-white" to="/edit-profile">Edit Profile</Link>
          </Dropdown.Item>
          <Dropdown.Item className='hover:bg-neutral-600'>
            <Link className="text-white hover:text-white" to="/my-builds">My Builds</Link>
          </Dropdown.Item>
          <Dropdown.Item className='hover:bg-neutral-600'>
            <Link className="text-white hover:text-white" to="/my-bookmarks">My Bookmarks</Link>
          </Dropdown.Item>
          <Dropdown.Item className='hover:bg-neutral-600'>
            <a className="text-white hover:text-white" href="#" onClick={logout}>Log Out</a>
          </Dropdown.Item>
          {isAdmin && (
            <Dropdown.Item className='hover:bg-neutral-600'>
              <Link className="text-white hover:text-white" to="/admin-tools">Admin</Link>
            </Dropdown.Item>
          )}
        </Dropdown.Menu>
      </Dropdown>
    </div>
  )

}

export default UserMenu
