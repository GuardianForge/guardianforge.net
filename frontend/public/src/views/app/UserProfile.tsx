import React, { useEffect, useState, useContext } from 'react'
import GuardianCard from '../../components/GuardianCard'
import Loading from '../../components/Loading'
import { GlobalContext } from '../../contexts/GlobalContext'
import userUtils from "../../utils/userUtils"
import { Helmet } from 'react-helmet'
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import BuildSummaryCard from '../../components/BuildSummaryCard'
import Guardian from '../../models/Guardian'
import User from '../../models/User'
import DestinyMembership from '../../models/DestinyMembership'
import Card from '../../components/ui/Card'
import { Col, Row } from 'react-bootstrap'
import ForgeButton from '../../components/forms/Button'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import AppLayout from '../../layouts/AppLayout'
import TabGroup from '../../components/ui/TabGroup'
import TabItem from '../../components/ui/TabItem'
import { faFacebook, faTwitch, faTwitter, faYoutube } from '@fortawesome/free-brands-svg-icons'
import BuildSummary from '../../models/BuildSummary'
import UserProfileInfo from '../../components/UserProfileInfo'

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


function UserProfile() {
  const { username } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const { isInitDone, isConfigLoaded, setPageTitle } = useContext(GlobalContext)
  const [user, setUser] = useState<User>({})
  const [forgeUser, setForgeUser] = useState<User>({})
  const [membership, setMembership] = useState<DestinyMembership>({})
  const [guardians, setGuardians] = useState<Array<Guardian>>([])
  const [compState, setCompState] = useState(COMPSTATE.LOADING)
  const [areBuildsShown, setAreBuildsShown] = useState(false)
  const [userHasNoDestinyMemberships, setUserHasNoDestinyMemberships] = useState(false)

  const [displayName, setDisplayName] = useState<string>()
  const [about, setAbout] = useState<string>()
  const [facebookUrl, setFacebookUrl] = useState<string>()
  const [twitterUrl, setTwitterUrl] = useState<string>()
  const [youtubeUrl, setYoutubeUrl] = useState<string>()
  const [twitchUrl, setTwitchUrl] = useState<string>()
  const [tab, setTab] = useState<number>(1)

  useEffect(() => {
    async function init() {
      if(!isInitDone) return
      let code = location.hash.replace("#", "")
      const { BungieApiService, ForgeApiService } = window.services
      // @ts-ignore TODO: Fix me
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



  useEffect(() => {
    if(user) {
      setDisplayName(`${user.bungieGlobalDisplayName}#${user.bungieGlobalDisplayNameCode}`)
    }
  }, [user])

  useEffect(() => {
    if(forgeUser?.user?.about) {
      setAbout(forgeUser.user.about)
    }
    if(forgeUser?.user?.social?.facebook) {
      setFacebookUrl(forgeUser.user.social.facebook)
    }
    if(forgeUser?.user?.social?.twitch) {
      setTwitchUrl(forgeUser.user.social.twitch)
    }
    if(forgeUser?.user?.social?.twitter) {
      setTwitterUrl(forgeUser.user.social.twitter)
    }
    if(forgeUser?.user?.social?.youtube) {
      setYoutubeUrl(forgeUser.user.social.youtube)
    }
  }, [forgeUser])

  function goToGuardian(guardianId: string) {
    navigate(`/app/g/${membership.type}-${membership.id}-${guardianId}`)
  }

  function goToSearch() {
    navigate(`/app/find-players`)
  }

  return (
    <AppLayout>
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
            <div className="flex flex-col">
              <UserProfileInfo
                about={about}
                facebookUrl={facebookUrl}
                twitterUrl={twitterUrl}
                youtubeUrl={youtubeUrl}
                twitchUrl={twitchUrl} />

              <TabGroup>
                <TabItem onClick={() => setTab(1)} active={tab === 1}>
                  Guardians
                </TabItem>
                <TabItem onClick={() => setTab(2)} active={tab === 2}>
                  Builds
                </TabItem>
              </TabGroup>
              {tab === 1 && (
                <div className="flex flex-col gap-2">
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

              {tab === 2 && (
                <div className="grid md:grid-cols-3 gap-3">
                  {!forgeUser && <div>This user has no builds.</div>}
                  {forgeUser.builds && forgeUser.builds.map((bs: BuildSummary) => (
                    <BuildSummaryCard key={bs.id} buildSummary={bs} isPublicUi />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </Wrapper>
    </AppLayout>
  )
}

export default UserProfile
