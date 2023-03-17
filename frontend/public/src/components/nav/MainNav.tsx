import { useContext, useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// @ts-ignore
import SiteLogo from "../../images/site-logo.png"
import { Link, LinkProps } from "react-router-dom"
import { Container, Navbar, Nav } from 'react-bootstrap'
import { faCube, faSignInAlt, faUser, faHamburger, faBars, faClose } from '@fortawesome/free-solid-svg-icons'
import { GlobalContext } from '../../contexts/GlobalContext'

function NavLink(props: LinkProps) {
  return <Link {...props} className={`text-white md:text-gray-400 hover:text-white transition text-lg md:text-inherit`}>
    { props.children }
  </Link>
}

type MobileMenuProps = {
  open: boolean
  onClose: Function
  loginUrl: string
}

function MobileMenu({ open, onClose, loginUrl }: MobileMenuProps) {
  return (
    <div className={`absolute top-0 h-screen w-full bg-forgebg opacity-95 transition z-50 md:hidden overscroll-none ${open ? "visible" : "hidden"}`}>
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
        <a className="text-white hover:text-white text-lg" href={loginUrl}>
          <FontAwesomeIcon icon={faSignInAlt} /> Login w/Bungie
        </a>
      </div>
    </div>
  )
}

function MainNav() {
  const { isClientLoaded } = useContext(GlobalContext)
  const [loginUrl, setLoginUrl] = useState("")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    if(!isClientLoaded) return
    function init() {
      let { ForgeClient } = window.services
      if(ForgeClient.config && ForgeClient.config.loginUrl) {
        setLoginUrl(ForgeClient.config.loginUrl)
      }
    }
    init()
  }, [isClientLoaded])

  return (
    <nav>
      <div className="flex items-center p-2">
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
        </div>
        <a className="text-gray-400 hover:text-white transition hidden md:block" href={loginUrl}>
          <FontAwesomeIcon icon={faSignInAlt} /> Login w/Bungie
        </a>

        <div className="flex md:hidden flex-1 justify-end text-xl mr-2">
          <FontAwesomeIcon className="hover:cursor-pointer" icon={faBars} onClick={() => setIsMobileMenuOpen(true)} />
        </div>
      </div>
      <MobileMenu open={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} loginUrl={loginUrl} />
    </nav>
  )
}

export default MainNav
