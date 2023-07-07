import { useContext, useState, useEffect, ButtonHTMLAttributes } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// @ts-ignore
import SiteLogo from "../../images/site-logo.png"
import { Link, LinkProps, useNavigate } from "react-router-dom"
import { faCube, faSignInAlt, faBars, faClose, faSearch, faCubes, faBookmark, faLock, faDoorClosed, faUser, faPencil } from '@fortawesome/free-solid-svg-icons'
import { GlobalContext } from '../../contexts/GlobalContext'
import ForgeButton from '../forms/Button'
import UserMenu from '../UserMenu'
import SearchModal from '../SearchModal'
import User from '../../models/User'

function NavLink(props: LinkProps) {
  return <Link {...props} className={`text-white md:text-gray-300 hover:text-white transition text-lg`}>
    { props.children }
  </Link>
}

interface NavLinkButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {

}

function NavLinkButton(props: NavLinkButtonProps) {
  return <button {...props} className={`text-white md:text-gray-300 hover:text-white transition text-lg ${props.className}`}>
    { props.children }
  </button>
}

type MobileMenuProps = {
  open: boolean
  onClose: Function
  loginUrl: string,
  onSearchClicked: Function
}

function MobileMenu({ open, onClose, loginUrl, onSearchClicked }: MobileMenuProps) {
  const { isClientLoaded, isLoggedIn, isUserDataLoaded } = useContext(GlobalContext)
  const navigate = useNavigate()
  const [userData, setUserData] = useState<User>({})
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    function preventScroll(e: any) {
      e.stopPropagation()
      e.preventDefault()
    }

    let el = document.getElementById("mobile_menu")
    el?.addEventListener("wheel", preventScroll, { passive: false })
  }, [open])

  useEffect(() => {
    if(!isClientLoaded) return
    if(!isLoggedIn) return
    if(!isUserDataLoaded) return
    let { ForgeClient } = window.services
    if(ForgeClient.userData) {
      setUserData(ForgeClient.userData)
      if(ForgeClient.userData.bungieNetUser && ForgeClient.userData.bungieNetUser.membershipId === "14214042") {
        setIsAdmin(true)
      }
    }

  }, [isClientLoaded, isLoggedIn, isUserDataLoaded])

  function redirectToLogin() {
    window.open(loginUrl, "_self")
  }

  function logout() {
    const { ForgeClient } = window.services
    ForgeClient.logout()
  }

  function navigateTo(to: string) {
    navigate(to)
    onClose()
  }

  return (
    <div id="mobile_menu" className={`absolute top-0 h-screen w-full bg-forgebg opacity-95 transition z-50 md:hidden overscroll-none ${open ? "visible" : "hidden"}`}>
      <div className="flex items-center justify-between p-2 border-b-gray-800 border-b">
        <Link className="flex items-center text-xl mr-4 text-white hover:text-white" to="/">
          <img src={SiteLogo} alt="GuardianForge Logo" className="h-[40px] w-[40px] mr-2" /> GuardianForge
        </Link>
        <div className='text-xl mr-2'>
          <FontAwesomeIcon className="hover:cursor-pointer" onClick={() => onClose()} icon={faClose} />
        </div>
      </div>
      <div className="flex flex-col gap-4 pl-4 mt-4">
        <NavLinkButton className='flex items-center gap-1' onClick={() => onSearchClicked()}>
          <FontAwesomeIcon icon={faSearch} /> Search
        </NavLinkButton>
        <NavLink className="" to="/create-build">
          <FontAwesomeIcon icon={faCube} /> Create Build
        </NavLink>
        {!isLoggedIn ? (
          <ForgeButton className='mr-3' onClick={() => redirectToLogin()}>
            <FontAwesomeIcon icon={faSignInAlt} /> Login w/Bungie
          </ForgeButton>
        ) : (
          <>
            <NavLinkButton className='flex items-center gap-1' onClick={() => navigateTo(`/u/${userData?.bungieNetUser?.uniqueName}`)}>
              <FontAwesomeIcon icon={faUser} /> My Profile
            </NavLinkButton>
            <NavLinkButton className='flex items-center gap-1' onClick={() => navigateTo(`/u/${userData?.bungieNetUser?.uniqueName}?tab=5`)}>
              <FontAwesomeIcon icon={faPencil}/> Edit Profile
            </NavLinkButton>
            <NavLinkButton className='flex items-center gap-1' onClick={() => navigateTo(`/u/${userData?.bungieNetUser?.uniqueName}?tab=2`)}>
              <FontAwesomeIcon icon={faCubes} /> My Builds
            </NavLinkButton>
            <NavLinkButton className='flex items-center gap-1' onClick={() => navigateTo(`/u/${userData?.bungieNetUser?.uniqueName}?tab=4`)}>
              <FontAwesomeIcon icon={faBookmark} /> My Bookmarks
            </NavLinkButton>
            <NavLinkButton className='flex items-center gap-1' onClick={logout}>
              <FontAwesomeIcon icon={faDoorClosed} /> Log Out
            </NavLinkButton>
            {isAdmin && (
              <NavLink to="/admin-tools">
                <FontAwesomeIcon icon={faLock}/>  Admin
              </NavLink>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function MainNav() {
  const { isClientLoaded, isLoggedIn } = useContext(GlobalContext)
  const [loginUrl, setLoginUrl] = useState("")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    if(!isClientLoaded) return
    function init() {
      let { ForgeClient } = window.services

      if(ForgeClient?.config?.loginUrl) {
        setLoginUrl(ForgeClient.config.loginUrl)
      }
    }
    init()
  }, [isClientLoaded])

  function redirectToLogin() {
    window.open(loginUrl, "_self")
  }

  function onSearchClicked() {
    setIsMobileMenuOpen(false)
    setIsSearchModalOpen(true)
  }

  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)

  return (
    <nav>
      <div className="flex items-center p-2 border-b border-b-neutral-800 mb-2">
        <Link className="flex items-center text-xl mr-4 text-white hover:text-white" to="/">
          <img src={SiteLogo} alt="GuardianForge Logo" className="h-[40px] w-[40px] mr-2" /> GuardianForge
        </Link>
        <div className="hidden items-center gap-4 flex-1 md:flex">
          <NavLinkButton onClick={() => setIsSearchModalOpen(true)}>
            <FontAwesomeIcon icon={faSearch} /> Search
          </NavLinkButton>
          <NavLink to="/create-build">
            <FontAwesomeIcon icon={faCube} /> Create Build
          </NavLink>
        </div>

        {isLoggedIn ? (
          <UserMenu onClickMobile={() => setIsMobileMenuOpen(true)} />
        ) : (
          <>
            <ForgeButton className='hidden md:block' onClick={() => redirectToLogin()}>
              <FontAwesomeIcon icon={faSignInAlt} /> Login w/Bungie
            </ForgeButton>
            <div className="flex md:hidden flex-1 justify-end text-xl mr-2">
              <FontAwesomeIcon className="hover:cursor-pointer" icon={faBars} onClick={() => setIsMobileMenuOpen(true)} />
            </div>
          </>
        )}

      </div>

      <SearchModal
        show={isSearchModalOpen}
        onHide={() => setIsSearchModalOpen(false)} />

      <MobileMenu
        open={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onSearchClicked={onSearchClicked}
        loginUrl={loginUrl} />
    </nav>
  )
}

export default MainNav
