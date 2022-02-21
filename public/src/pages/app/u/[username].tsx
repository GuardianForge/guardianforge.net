import React, { useEffect, useState, useContext } from 'react'
import { navigate } from 'gatsby'
import GuardianCard from '../../../components/app/GuardianCard'
import Loading from '../../../components/app/Loading'
// @ts-ignore
import { GlobalContext } from '../../../contexts/GlobalContext'
import userUtils from "../../../utils/userUtils"
import { Helmet } from 'react-helmet'
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import BuildSummaryCard from '../../../components/app/BuildSummaryCard'
import Guardian from '../../../models/Guardian'
import User from '../../../models/User'
import DestinyMembership from '../../../models/DestinyMembership'
import Card from '../../../components/app/ui/Card'
import { Col, Row } from 'react-bootstrap'
import ForgeButton from '../../../components/app/forms/Button'

const Wrapper = styled.div`
  .error-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;

    span {
      margin-bottom: 10px;
    }

    button {
      width: 200px;
    }
  }
`

const UserMenuWrapper = styled(Card)`
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
  NO_DATA: 3,
  NO_MEMBERSHIPS: 4,
}

type Props = {
  username: string
  location: Location
}

function PublicProfile(props: Props) {
  const { username, location } = props

  const { isInitDone, isConfigLoaded, setPageTitle } = useContext(GlobalContext)
  const [user, setUser] = useState<User>({})
  const [forgeUser, setForgeUser] = useState<User>({})
  const [membership, setMembership] = useState<DestinyMembership>({})
  const [guardians, setGuardians] = useState<Array<Guardian>>([])
  const [compState, setCompState] = useState(COMPSTATE.LOADING)
  const [areBuildsShown, setAreBuildsShown] = useState(false)
  const [userHasNoDestinyMemberships, setUserHasNoDestinyMemberships] = useState(false)


  useEffect(() => {
    async function init() {
      if(!isInitDone) return
      let code = location.hash.replace("#", "")
      const { BungieApiService, ForgeApiService } = window.services
      const searchRes = await BungieApiService.searchBungieNetUsers(username)
      // TODO: Handle this better
      if(searchRes && searchRes.length > 0) {
        let user = searchRes.find((el: User) => el.bungieGlobalDisplayName === username && el.bungieGlobalDisplayNameCode === Number(code))
        if(user) {
          setUser(user)
          if (!user.destinyMemberships || user.destinyMemberships.length === 0) {
            setUserHasNoDestinyMemberships(true)
            setCompState(COMPSTATE.NO_MEMBERSHIPS)
            return
          }

          setPageTitle(`${user.bungieGlobalDisplayName}#${user.bungieGlobalDisplayNameCode}`)

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
            setGuardians(guardians)
            setCompState(COMPSTATE.DONE)
          } else {
            setCompState(COMPSTATE.NO_DATA)
          }
        } else {
          setCompState(COMPSTATE.NO_DATA)
        }
      } else {
        console.warn("cant find that user")
      }
    }
    init()
  }, [isInitDone])

  function goToGuardian(guardianId: string) {
    navigate(`/app/g/${membership.type}-${membership.id}-${guardianId}`)
  }

  function goToSearch() {
    navigate(`/app/find-players`)
  }

  return (
    <Wrapper>
      <Helmet>
        <title>GuardianForge</title>
      </Helmet>
      <div className="container-fluid pt-3">
        {compState === COMPSTATE.LOADING && (<Loading />)}
        {compState === COMPSTATE.NO_DATA && (
          <Row>
            <Col>
              <div className="error-wrapper">
                <span>Unable to load this user's Guardians. Please check the username or try again later.</span>
                <ForgeButton onClick={goToSearch}>Back to Find Players</ForgeButton>
              </div>
            </Col>
          </Row>
        )}
        {compState === COMPSTATE.NO_MEMBERSHIPS && (
          <Row>
            <Col>
              <div className="error-wrapper">
                <span>This user has no Destiny memberships.</span>
                <ForgeButton onClick={goToSearch}>Back to Find Players</ForgeButton>
              </div>
            </Col>
          </Row>
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
                  {forgeUser && forgeUser.user && (
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
                {forgeUser.builds && forgeUser.builds.map(bs => (
                  <div key={bs.id} className="col-md-6">
                    <BuildSummaryCard buildSummary={bs} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="col-md-8">
                {guardians.map((g: Guardian) => (
                  <GuardianCard key={g.characterId}
                    classType={g.classType as string}
                    raceType={g.raceType as string}
                    light={g.light as string}
                    emblemUrl={g.emblemBackgroundPath as string}
                    onClick={() => goToGuardian(g.characterId as string)} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Wrapper>
  )
}

export default PublicProfile
