import { useContext, useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// @ts-ignore
import SiteLogo from "../../images/site-logo.png"
import { Link, LinkProps } from "react-router-dom"
import { faCube, faSignInAlt, faUser, faHamburger, faBars, faClose } from '@fortawesome/free-solid-svg-icons'
import { GlobalContext } from '../../contexts/GlobalContext'
import ForgeButton from '../forms/Button'
import UserMenu from '../UserMenuMain'

function NavLink(props: LinkProps) {
  return <Link {...props} className={`text-white md:text-gray-300 hover:text-white transition text-lg`}>
    { props.children }
  </Link>
}

type MobileMenuProps = {
  open: boolean
  onClose: Function
  loginUrl: string,
  isLoggedIn: boolean
}

function MobileMenu({ open, onClose, loginUrl, isLoggedIn }: MobileMenuProps) {

  useEffect(() => {
    function preventScroll(e: any) {
      e.stopPropagation()
      e.preventDefault()
    }

    let el = document.getElementById("mobile_menu")
    el?.addEventListener("wheel", preventScroll, { passive: false })
  }, [open])

  function redirectToLogin() {
    window.open(loginUrl, "_self")
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
        <NavLink className="" to="/find-players">
          <FontAwesomeIcon icon={faUser} /> Find Players
        </NavLink>
        <NavLink className="" to="/find-builds">
          <FontAwesomeIcon icon={faCube} /> Find Builds
        </NavLink>
        <NavLink className="" to="/create-build">
          <FontAwesomeIcon icon={faCube} /> Create Build
        </NavLink>
        {!isLoggedIn && (
          <ForgeButton onClick={() => redirectToLogin()}>
            <FontAwesomeIcon icon={faSignInAlt} /> Login w/Bungie
          </ForgeButton>
        )}
      </div>
    </div>
  )
}

function MainNav() {
  const { isClientLoaded } = useContext(GlobalContext)
  const [loginUrl, setLoginUrl] = useState("")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    if(!isClientLoaded) return
    function init() {
      let { ForgeClient } = window.services

      if(ForgeClient?.config?.loginUrl) {
        setLoginUrl(ForgeClient.config.loginUrl)
      }

      if(ForgeClient?.isLoggedIn()) {
        setIsLoggedIn(true)
      }
    }
    init()
  }, [isClientLoaded])

  function redirectToLogin() {
    window.open(loginUrl, "_self")
  }

  return (
    <nav className=''>
      <div className="flex items-center p-2 border-b border-b-neutral-800 mb-2">
        <Link className="flex items-center text-xl mr-4 text-white hover:text-white" to="/">
          <img src={SiteLogo} alt="GuardianForge Logo" className="h-[40px] w-[40px] mr-2" /> GuardianForge
        </Link>
        <div className="hidden items-center gap-4 flex-1 md:flex">
          <NavLink className="" to="/find-players">
            <FontAwesomeIcon icon={faUser} /> Find Players
          </NavLink>
          <NavLink className="" to="/find-builds">
            <FontAwesomeIcon icon={faCube} /> Find Builds
          </NavLink>
          <NavLink className="" to="/create-build">
            <FontAwesomeIcon icon={faCube} /> Create Build
          </NavLink>
        </div>

        {isLoggedIn ? (
          <UserMenu />
        ) : (
          <ForgeButton className='hidden md:block' onClick={() => redirectToLogin()}>
            <FontAwesomeIcon icon={faSignInAlt} /> Login w/Bungie
          </ForgeButton>
        )}

        <div className="flex md:hidden flex-1 justify-end text-xl mr-2">
          <FontAwesomeIcon className="hover:cursor-pointer" icon={faBars} onClick={() => setIsMobileMenuOpen(true)} />
        </div>
      </div>
      <MobileMenu
        open={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        isLoggedIn={isLoggedIn}
        loginUrl={loginUrl} />
    </nav>
  )
}

export default MainNav
