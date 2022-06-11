import { useEffect, useContext, useState, ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import styled, { createGlobalStyle } from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faCube, faBookmark, faUsers, faCubes, faPlus, faHome } from '@fortawesome/free-solid-svg-icons'
import colors from "../colors"
import { GlobalContext } from "../contexts/GlobalContext"
import UserMenu from '../components/UserMenu'
import { Offcanvas } from 'react-bootstrap'
// @ts-ignore
import SiteLogo from "../images/site-logo.png"
import AlertLayer from '../components/alerting/AlertLayer'
import { Toggles } from '../toggles'
import FeatureToggleWrapper from '../components/FeatureToggle'
import ForgeModal from '../components/Modal'
import ForgeButton from '../components/forms/Button'
import { Helmet } from 'react-helmet'
import SubscribeModal from '../components/stripe/SubscribeModal'

const GlobalStyle = createGlobalStyle`
  body {
    height: 100vh;
    margin: 0px;
    background-color: #15141d !important;
  }

  #___gatsby {
    height: 100% !important;
  }

  #gatsby-focus-wrapper {
    height: 100% !important;
  }
`

const Layout = styled.div`
  display: flex;
  height: 100%;
  position: relative;

  .highlightable {
    &:hover {
      cursor: pointer;
    }

    animation: highlightable 2s infinite;
  }

  .highlighted {
    border: 2px solid ${colors.theme2.highlightColor} !important;
  }

  /* Animations */
  @keyframes highlightable {
    0% {
      border-color: ${colors.theme2.highlightColor};
    }
    50% {
      border-color: rgba(255, 255, 0, 0.1);
    }
    100% {
      border-color: ${colors.theme2.highlightColor};
    }
  }
`

const MobileMenu = styled(Offcanvas)`
  background-color: ${colors.theme2.bg} !important;

  .logo {
    margin-right: 10px;
  }

  .nav-header {
    a {
      text-decoration: none;
      color: inherit;
    }

    button {
      color: ${colors.theme2.text};
    }
  }

  .nav-main {
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

  .nav-link {
		text-decoration: none;
		color: #aaa !important;
		padding: 5px;
		margin: 0px 0px 25px 5px;
    font-size: 18px;
    color: ${colors.theme2.icon} !important;
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
`

const Sidebar = styled.div`
  width: 250px;
  background-color: ${colors.theme2.bg};
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
    color: ${colors.theme2.icon} !important;
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

      &-small {
        font-size: 16px !important;
      }
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

type Props = {
  children: ReactNode
}

function AppLayout(props: Props) {
  const { children } = props
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isInitDone, isClientLoaded, initApp, pageTitle, redirectToLogin } = useContext(GlobalContext)
  const [isSubscribeSuccessModalDisplayed, setIsSubscribeSuccessModalDisplayed] = useState(false)
  const [isSubscribeErrorModalDisplayed, setIsSubscribeErrorModalDisplayed] = useState(false)
  const [isSubscribeModalShowing, setIsSubscribeModalShowing] = useState(false)

  useEffect(() => {
    if(!isInitDone) {
      initApp()
    }
  }, [isInitDone])

  useEffect(() => {
    if(!isClientLoaded) return
    const { ForgeClient } = window.services
    if(!ForgeClient.isLoggedIn()) {
      redirectToLogin()
    }
  }, [isClientLoaded])

  useEffect(() => {
    // Display subscription messages
    let query = location.search
    query = query.replace("?", "")
    let querysplit = query.split("&")
    let queryKeys = new Map<string, string>()
    querysplit.forEach(el => {
      let split2 = el.split("=")
      queryKeys.set(split2[0], split2[1])
    })
    console.log(queryKeys)
    if(queryKeys.get("subscribe") && queryKeys.get("subscribe") === "success") {
      setIsSubscribeSuccessModalDisplayed(true)
    }
    if(queryKeys.get("subscribe") && queryKeys.get("subscribe") === "error") {
      setIsSubscribeErrorModalDisplayed(true)
    }
    if(queryKeys.get("showSubscribeModal") && queryKeys.get("showSubscribeModal") === "true") {
      setIsSubscribeModalShowing(true)
    }

    // Setup fix for Adsense style hijacking
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

  function onMenuBtnClicked() {
    setIsMenuOpen(true)
  }

  function onMenuHidden() {
    setIsMenuOpen(false)
  }

  const navItems = [
    {
      name: "Home",
      icon: faHome,
      path: "/app"
    },
    {
      name: "Create Build",
      icon: faPlus,
      path: "/app/create-build"
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
      <GlobalStyle />
      <Helmet>
        <title>{`${pageTitle ? `${pageTitle} - ` : ""}GuardianForge`}</title>
      </Helmet>
      <Sidebar className="d-none d-xl-flex">
        <div className="nav-header">
          <div className="branding">
            <Link to="/app">
              <img className="logo" alt="GuardianForge Logo" height="40" width="40" src={SiteLogo} />GuardianForge
            </Link>
          </div>
        </div>
        <div className="nav-main">
          <div className="nav-section">
            <ul>
              {navItems.map((ni: any, idx: any) => (
                <li key={`nav-item-${idx}`}>
                  <Link className={`nav-link ${location.pathname === ni.path ? 'nav-link-active' : ''}`} to={ni.path}>
                    <div className="nav-icon-wrapper"><FontAwesomeIcon icon={ni.icon} /></div> {ni.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="nav-footer">

        </div>
      </Sidebar>

      {/* Mobile Menu */}
      <MobileMenu className="mobile-menu" show={isMenuOpen} onHide={onMenuHidden}>
        <Offcanvas.Header className="nav-header" closeButton closeVariant='white'>
          <Offcanvas.Title>
            <Link to="/app" onClick={() => setIsMenuOpen(false)}>
              <img className="logo" alt="GuardianForge Logo" height="40" width="40" src={SiteLogo} />GuardianForge
            </Link>
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <div className="nav-main">
            <div className="nav-section">
              <UserMenu isMobile onMenuItemClicked={() => setIsMenuOpen(false)} />
              <ul>
                {navItems.map((ni: any, idx: any) => (
                  <li key={`nav-item-${idx}`}>
                    <Link className={`nav-link ${location.pathname === ni.path ? 'nav-link-active' : ''}`} to={ni.path} onClick={() => setIsMenuOpen(false)}>
                      <div className="nav-icon-wrapper"><FontAwesomeIcon icon={ni.icon} /></div> {ni.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Offcanvas.Body>
      </MobileMenu>

      <Main id="appLayoutMain">
        <AppBar>
          <div className="app-bar-left">
            <FontAwesomeIcon onClick={onMenuBtnClicked} icon={faBars} className="menu-btn d-block d-xl-none d-xxl-none" />
            <div className={`app-bar-title d-block d-xl-none d-xxl-none ${pageTitle && pageTitle.length > 28 ? "app-bar-title-small" : ""}`}>
              {pageTitle}
            </div>

            <div className="app-bar-title d-none d-xl-block">
              {pageTitle}
            </div>
          </div>
          <div className="app-bar-right d-none d-xl-block">
            <UserMenu />
          </div>
        </AppBar>
        <Content>
          { children }
        </Content>
        <AlertLayer />
      </Main>

      <ForgeModal
        title="Thank you!"
        show={isSubscribeSuccessModalDisplayed}
        footer={<ForgeButton onClick={() => setIsSubscribeSuccessModalDisplayed(false)}>Ok</ForgeButton>}>
        <p>Thank you so much for subscribing to GuardianForge! Your support means the world to me. Enjoy your ad-free experience.</p>
        <p>- Brian (@brianmmdev)</p>
      </ForgeModal>

      <ForgeModal title="Subscribe Error" show={isSubscribeErrorModalDisplayed} footer={<ForgeButton onClick={() => setIsSubscribeErrorModalDisplayed(false)}>Ok</ForgeButton>}>
        <p>Something went wrong while subscribing to GuardianForge. Please try again later, or contact me to resolve the issue.</p>
        <p>- Brian (@brianmmdev)</p>
      </ForgeModal>

      <SubscribeModal show={isSubscribeModalShowing} onHide={() => setIsSubscribeModalShowing(false)} />

      <FeatureToggleWrapper toggle={Toggles.ShowBreakpoints}>
        <div style={{
          position: "fixed",
          top: "90%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "rgba(247, 201, 241, 0.4)",
          padding: ".5rem 1rem",
          zIndex: 10000,
          borderRadius: "30px"
        }}>
          <div className="d-block d-sm-none">Extra Small (xs)</div>
          <div className="d-none d-sm-block d-md-none">Small (sm)</div>
          <div className="d-none d-md-block d-lg-none">Medium (md)</div>
          <div className="d-none d-lg-block d-xl-none">Large (lg)</div>
          <div className="d-none d-xl-block d-xxl-none" >X-Large (xl)</div>
          <div className="d-none d-xxl-block" >XX-Large (xxl)</div>
        </div>
      </FeatureToggleWrapper>
    </Layout>
  )
}

export default AppLayout
