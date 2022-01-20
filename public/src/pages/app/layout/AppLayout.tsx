import React, { useEffect, useContext, useState } from 'react'
import { Link, navigate } from 'gatsby'
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faTimes, faSearch, faCube, faArrowLeft, faUser, faBookmark, faUsers, faCubes, faPlus, faBook } from '@fortawesome/free-solid-svg-icons'
import './AppLayout.css'
import colors from "../../../colors"
// @ts-ignore
import { GlobalContext } from "../../../contexts/GlobalContext.jsx"
import { Enums } from '@guardianforge/destiny-data-utils'
import Guardian from '../models/Guardian'
import UserMenu from '../components/UserMenu'
import { Image } from 'react-bootstrap'
// @ts-ignore
import SiteLogo from "../../../images/site-logo.png"
import Input from '../components/forms/Input'


const Layout = styled.div`
  display: flex;
  height: 100%;
  position: relative;
`

const Sidebar = styled.div`
  width: 250px;
  background-color: ${colors.theme2.bg};
  /* border-right: 1px solid ${colors.theme2.border}; */
  display: flex;
  flex-direction: column;
  z-index: 200;

  .logo {
    margin-right: 10px;

  }

  @media screen and (max-width: 992px) {
    position: absolute;
    height: 100%;
  }

  .nav-header {
    display: flex;
    height: 56px;
    align-items: center;
    padding: 0px 20px;

    .branding {
      margin-top: 10px;
      font-size: 22px;
      flex: 1;

      a {
        text-decoration: none;
        color: inherit;
      }
    }

    .nav-close-btn {
      height: 20px;
      width: 20px;

      &:hover {
        cursor: pointer;
      }
    }
  }

  .nav-link {
		text-decoration: none;
		color: #aaa !important;
		padding: 5px;
		margin: 0px 0px 25px 5px;
    font-size: 18px;
    color: ${colors.theme2.icon};
    display: flex;
    align-items: center;

		&:hover {
			color: #fff !important;
      cursor: pointer;

      .nav-icon-wrapper {
        background-color: ${colors.theme2.accent2};
      }
		}

    &-active {
      color: #fff !important;
      /* font-weight: 800; */

      .nav-icon-wrapper {
        background-color: ${colors.theme2.accent1};
      }

      &:hover {
        .nav-icon-wrapper {
          background-color: ${colors.theme2.accent1} !important;
        }
      }
    }

    .nav-icon-wrapper {
      /* background-color: ${colors.theme2.dark2}; */
      margin-right: 10px;
      padding: 12px;
      height: 30px;
      width: 30px;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 5px;
    }
	}

  .nav-main {
    padding: 20px;
    flex: 1;
    min-height: 1px;
    overflow-y: scroll;

    .nav-section {
      margin-bottom: 10px;
    }

    .nav-section-header {
      font-weight: bold;
      margin-bottom: 5px;
    }

    ul {
      margin: 0px;
      padding: 0px;
    }

    li {
      list-style-type: none;
      margin-bottom: 2px;

      a {
        padding: 8px 0px;
      }
    }
  }

  .nav-footer {
    height: 56px;
    display: flex;
    align-items: center;
    padding-left: 20px;
  }
`

const Main = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`

const AppBar = styled.div`
  width: 100%;
  height: 56px;
  display: flex;
  align-items: center;
  padding: 30px 20px 20px 20px;
  justify-content: space-between;

  .app-bar-left {
    display: flex;
    align-items: center;

    .search-wrapper {
      margin-left: 10px;
      width: 360px;
    }

    .search-wrapper > div {
      padding: 2px;
    }

    .app-bar-title {
      font-size: 22px;
    }
  }

  .app-bar-right {
    display: flex;
    align-items: center;

    svg {
      font-size: 20px;
      color: ${colors.theme2.icon};
      margin-right: 22px;
    }
  }

  .menu-btn {
    height: 25px;
    width: 25px;
    margin-right: 10px;

    &:hover {
      cursor: pointer;
    }
  }
`

const Content = styled.div`
  flex: 1;
  min-height: 1px;
  overflow-y: scroll;
`

const SidebarOverlay = styled.div`
  position: absolute;
  z-index: 100;
  background-color: rgba(0, 0, 0, 0.4);
  height: 100%;
  width: 100%;
`

type Props = {
  children: any,
  location: Location
}

function AppLayout(props: Props) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { children, location } = props
  const { isInitDone, initApp, pageTitle, setPageTitle } = useContext(GlobalContext)
  const [guardians, setGuardians] = useState<Array<Guardian>>([])
  // const [pageTitle, setPageTitle] = useState("")
  const [search, setSearch] = useState("")

  useEffect(() => {
    initApp()
  }, [isInitDone])


  useEffect(() => {
    let el3 = document.getElementById("appLayout")
    let el4 = document.getElementById("appLayoutMain")

    const observer = new MutationObserver(function (mutations, observer) {
      if(el3 && el3.style) el3.style.height = ''
      if(el4 && el4.style) el4.style.height = ''
    })

    if(el3) {
      observer.observe(el3, {
        attributes: true,
        attributeFilter: ['style']
      })
    }

    if(el4) {
      observer.observe(el4, {
        attributes: true,
        attributeFilter: ['style']
      })
    }
  }, [])

  useEffect(() => {
    // TODO: Fetch guardians
  }, [isInitDone])

  function onMenuBtnClicked() {
    setIsMenuOpen(true)
  }

  function onNavCloseBtnClicked() {
    setIsMenuOpen(false)
  }

  function navigateTo(name: string, to: string) {
    setPageTitle(name)
    navigate(to)
  }

  function showCreateBuildModal() {
    navigateTo("Create Build", "/app/create-build")
  }

  const navItems = [
    {
      name: "My Profile",
      icon: faUser,
      path: "/app/me"
    },
    {
      name: "My Guardians",
      icon: faCube,
      path: "/app/guardians"
    },
    {
      name: "My Builds",
      icon: faCube,
      path: "/app/my-builds"
    },
    {
      name: "Bookmarks",
      icon: faBookmark,
      path: "/app/bookmarks"
    },
    {
      name: "Find Builds",
      icon: faCubes,
      path: "/app/find-builds"
    },
    {
      name: "Find Players",
      icon: faUsers,
      path: "/app/find-players"
    }
  ]

  return (
    <Layout id="appLayout">
      <SidebarOverlay className={`d-lg-none ${isMenuOpen ? "" : "d-none"}`}/>
      <Sidebar className={isMenuOpen ? "" : "d-none d-lg-flex"}>
        <div className="nav-header">
          <div className="branding">
            <Link to="/app">
              <img className="logo" alt="GuardianForge Logo" height="40" width="40" src={SiteLogo} />GuardianForge
            </Link>
          </div>
          {isMenuOpen && (
            <FontAwesomeIcon className="nav-close-btn" icon={faTimes} onClick={onNavCloseBtnClicked}/>
          )}
        </div>
        <div className="nav-main">
          {/* {guardians.map((guardian: Guardian) => (
            <div>{ guardian.id }</div>
          ))} */}
          <div className="nav-section">
            <ul>
              {navItems.map((ni: any) => (
                <li>
                  <Link className={`nav-link ${location.pathname === ni.path ? 'nav-link-active' : ''}`} to={ni.path}>
                    <div className="nav-icon-wrapper"><FontAwesomeIcon icon={ni.icon} /></div> {ni.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="nav-footer">
          <FontAwesomeIcon icon={faArrowLeft} />
        </div>
      </Sidebar>
      <Main id="appLayoutMain">
        <AppBar>
          <div className="app-bar-left">
            <FontAwesomeIcon onClick={onMenuBtnClicked} icon={faBars} className="menu-btn d-block d-lg-none d-xl-none" />

            <div className="app-bar-title">
              {pageTitle}
            </div>
          </div>
          <div className="app-bar-right">
            <FontAwesomeIcon icon={faSearch} />
            <a className="create-build-icon" href="#" onClick={showCreateBuildModal}>
              <FontAwesomeIcon icon={faPlus} />
            </a>
            {/* <div className='search-wrapper'>
              <Input placeholder='Search...' prefixIcon={faSearch} value={search} onChange={(e: any) => setSearch(e.target.value)} />
            </div> */}
            <UserMenu />
          </div>
        </AppBar>
        <Content>
          { children }
        </Content>
      </Main>
    </Layout>
  )
}

export default AppLayout
