import React, { useContext, useState, useEffect } from 'react';
import styled from 'styled-components'
// @ts-ignore
import { GlobalContext } from "../../contexts/GlobalContext"
import { Link } from 'gatsby'
import { Container, Row } from 'react-bootstrap';
import colors from '../../colors'

const Wrapper = styled(Container)`

	.user-menu {
		margin: 5px;
		padding: 10px;
		background-color: ${colors.theme2.dark2};
		border-radius: 5px;
    margin-top: 10px;
	}
	.user-info {
		display: flex;
		align-items: center;
		padding-bottom: 10px;
	}
	.user-info-img {
		max-width: 50px;
		border-radius: 5px;
		margin-right: 5px;
	}
	.user-info-name {
		font-size: 1.5rem;
		font-weight: bold;
	}
	.user-nav {
		border-top: 1px solid #444;
		display: flex;
		flex-direction: column;
	}
	.user-nav-link {
		text-decoration: none;
		color: #aaa;
		padding: 5px;
		margin: 5px;
		&:hover {
			color: #fff;
		}

    &-active {
      color: #fff;
      font-weight: 800;
    }
	}
`

function Me() {
  const { isInitDone, setPageTitle } = useContext(GlobalContext)
  const [displayName, setDisplayName] = useState("")
  const [profilePicturePath, setProfilePicturePath] = useState("")

  useEffect(() => {
    setPageTitle("My Profile")
    if(!isInitDone) return
    function init() {
      const { ForgeClient } = window.services
      if(ForgeClient.isLoggedIn()) {
        const { displayName, profilePicturePath } = ForgeClient.userData.bungieNetUser
        setDisplayName(displayName)
        setProfilePicturePath(profilePicturePath)
      } else {
        // TODO: REDIRECT TO LOGIN
      }
    }
    init()
  }, [isInitDone])

  return (
    <Wrapper>
      <Row>
        <div className="col-md-4">
          <div className="user-menu">
            <div className="user-info">
              {profilePicturePath !== "" && <img src={`https://www.bungie.net${profilePicturePath}`} className="user-info-img" />}
              {displayName !== "" && (
                <span className="user-info-name">
                  { displayName }
                </span>
              )}
            </div>
            {/* <div className="user-nav">
              <Link to="/me" className={`user-nav-link ${location && location.pathname == '/me' ? 'user-nav-link-active' : ''}`}>
                Profile
              </Link>
              <Link to="/me/guardians" className={`user-nav-link ${location && location.pathname == '/me/guardians' ? 'user-nav-link-active' : ''}`}>
                My Guardians
              </Link>
              <Link to="/me/builds" className={`user-nav-link ${location && location.pathname == '/me/builds' ? 'user-nav-link-active' : ''}`}>
                My Builds
              </Link>
              <Link to="/me/bookmarks" className={`user-nav-link ${location && location.pathname == '/me/bookmarks' ? 'user-nav-link-active' : ''}`}>
                Bookmarked Builds
              </Link>
              <Link to="/me/private-builds" className={`user-nav-link ${location && location.pathname == '/me/private-builds' ? 'user-nav-link-active' : ''}`}>
                Private Builds
              </Link>
            </div> */}
          </div>
        </div>
        <div className="col-md-8">
          Stuff here
        </div>
      </Row>
    </Wrapper>
  )
}

export default Me;
