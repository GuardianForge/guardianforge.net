import React, { useEffect, useState, useContext } from 'react'
import { navigate } from 'gatsby'
import GuardianCard from '../../components/GuardianCard'
import Loading from '../../components/Loading'
import { GlobalContext } from '../../contexts/GlobalContext'
import userUtils from "../../utils/userUtils"
import { Helmet } from 'react-helmet'
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import BuildSummaryCard from '../../components/BuildSummaryCard'

const UserMenuWrapper = styled.div`
  padding: 10px;
  background-color: #1e1f24;
  border-radius: 5px;

	.user-info {
		display: flex;
    flex-direction: column;
		padding-bottom: 10px;
    margin-left: 5px;
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
		color: #eee;
		padding: 5px;
		margin: 5px;
    cursor: pointer;
		&:hover {
			color: #aaa;
		}
	}
`

const ForgeUserInfoWrapper = styled.div`
  span {
    font-style: italic;
    font-size: 16px;
  }

  svg {
    font-size: 20px;
    margin-right: 5px;
    margin-top: 5px;
  }

  a {
    color: #ddd;
  }

  .twitter-link:hover {
    color: #1da1f2;
  }

  .twitch-link:hover {
    color: #9146ff;
  }

  .youtube-link:hover {
    color: #ff0000;
  }

  .facebook-link:hover {
    color: #1877f2;
  }
`

const COMPSTATE = {
  LOADING: 1,
  DONE: 2,
  NO_DATA: 3
}

function PublicProfile({ username, location }) {
  const { isConfigLoaded } = useContext(GlobalContext)
  const [user, setUser] = useState({})
  const [forgeUser, setForgeUser] = useState({})
  const [membership, setMembership] = useState({})
  const [guardians, setGuardians] = useState([])
  const [compState, setCompState] = useState(COMPSTATE.LOADING)
  const [areBuildsShown, setAreBuildsShown] = useState(false)

  useEffect(() => {
    async function init() {
      if(!isConfigLoaded) return
      let code = location.hash.replace("#", "")
      const { BungieApiService, ForgeApiService, ForgeClient } = window.services
      if(ForgeClient.isLoggedIn()) {
        navigate(`/app/u/${username}#${code}`)
      }
      const searchRes = await BungieApiService.searchBungieNetUsers(username)
      // TODO: Handle this better
      if(searchRes && searchRes.length > 0) {
        let user = searchRes.find(el => el.bungieGlobalDisplayName === username && el.bungieGlobalDisplayNameCode === Number(code))
        setUser(user)

        if(user.bungieNetMembershipId) {
          let forgeUser = await ForgeApiService.fetchForgeUser(user.bungieNetMembershipId)
          if(forgeUser) {
            setForgeUser(forgeUser)
          }
        }

        // Load guardians
        let { membershipType, membershipId } = userUtils.parseMembershipFromProfile(user)
        setMembership({ type: membershipType, id: membershipId })
        let res = await BungieApiService.fetchCharactersList(membershipType, membershipId)
        let guardians = Object.keys(res.characters.data).map(key => res.characters.data[key])
        if(guardians.length > 0) {
          guardians.sort((a, b) => new Date(b.dateLastPlayed) - new Date(a.dateLastPlayed))
          setGuardians(guardians)
          setCompState(COMPSTATE.DONE)
        } else {
          setCompState(COMPSTATE.NO_DATA)
        }
      } else {
        console.warn("cant find that user")
      }
    }
    init()
  }, [isConfigLoaded])

  function goToGuardian(guardianId) {
    navigate(`/g/${membership.type}-${membership.id}-${guardianId}`)
  }

  return (
    <div>
      <Helmet>
        <title>GuardianForge</title>
      </Helmet>
      <div className="container pt-3">
        {compState === COMPSTATE.LOADING && (<Loading />)}
        {compState === COMPSTATE.NO_DATA && (
          <div>
            Unable to load this user's Guardians. Please check the username or try again later.
          </div>
        )}
        {compState === COMPSTATE.DONE && (
          <div className="row">
            <div className="col-md-4">
              <UserMenuWrapper>
                <div className="user-info">
                  {user && (
                    <span className="user-info-name">
                      {user.bungieGlobalDisplayName}#{user.bungieGlobalDisplayNameCode}
                    </span>
                  )}
                  {forgeUser && (
                    <ForgeUserInfoWrapper>
                      {forgeUser.user.about && <span>"{ forgeUser.user.about }"</span>}
                      {forgeUser.user.social && (
                        <div className="socials">
                          {forgeUser.user.social.twitter && (
                            <a href={forgeUser.user.social.twitter} className="twitter-link" target="_blank">
                              <FontAwesomeIcon icon={['fab', 'twitter']} />
                            </a>
                          )}
                          {forgeUser.user.social.twitch && (
                            <a href={forgeUser.user.social.twitch} className="twitch-link" target="_blank">
                              <FontAwesomeIcon icon={['fab', 'twitch']} />
                            </a>
                          )}
                          {forgeUser.user.social.youtube && (
                            <a href={forgeUser.user.social.youtube} className="youtube-link" target="_blank">
                              <FontAwesomeIcon icon={['fab', 'youtube']} />
                            </a>
                          )}
                          {forgeUser.user.social.facebook && (
                            <a href={forgeUser.user.social.facebook} className="facebook-link" target="_blank">
                              <FontAwesomeIcon icon={['fab', 'facebook']} />
                            </a>
                          )}
                        </div>
                      )}
                    </ForgeUserInfoWrapper>
                  )}
                </div>
                {forgeUser && forgeUser.builds && forgeUser.builds.length > 0 && (
                  <div className="user-nav">
                    <a className="user-nav-link" onClick={() => setAreBuildsShown(false)}>
                      Guardians
                    </a>
                    <a className="user-nav-link" onClick={() => setAreBuildsShown(true)}>
                      Builds
                    </a>
                  </div>
                )}
              </UserMenuWrapper>
            </div>
            {areBuildsShown ? (
              <div className="col-md-8 row">
                {forgeUser.builds.map(bs => (
                  <div key={bs.id} className="col-md-6">
                    <BuildSummaryCard buildSummary={bs} showArchiveButton />
                  </div>
                ))}
              </div>
            ) : (
              <div className="col-md-8">
                {guardians.map(g => (
                  <GuardianCard key={g.characterId}
                    classType={g.classType}
                    raceType={g.raceType}
                    light={g.light}
                    emblemUrl={g.emblemBackgroundPath}
                    onClick={() => goToGuardian(g.characterId)} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default PublicProfile
