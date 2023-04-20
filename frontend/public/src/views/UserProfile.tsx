import React, { useEffect, useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import GuardianCard from '../components/GuardianCard'
import Loading from '../components/Loading'
import { GlobalContext } from '../contexts/GlobalContext'
import userUtils from "../utils/userUtils"
import { Helmet } from 'react-helmet'
import BuildSummaryCard from '../components/BuildSummaryCard'
import User from '../models/User'
import DestinyMembership from '../models/DestinyMembership'
import Guardian from '../models/Guardian'
import { BungieOfflineAlert } from '../models/AlertDetail'
import { useLocation, useParams } from 'react-router-dom'
import BuildSummary from '../models/BuildSummary'
import MainLayout from '../layouts/MainLayout'
import TabGroup from '../components/ui/TabGroup'
import TabItem from '../components/ui/TabItem'
import UserProfileInfo from '../components/UserProfileInfo'

const COMPSTATE = {
  LOADING: 1,
  DONE: 2,
  NO_DATA: 3
}

function UserProfile() {
  const { username } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { isConfigLoaded, dispatchAlert, isLoggedIn, isUserDataLoaded, isClientLoaded } = useContext(GlobalContext)
  const [user, setUser] = useState<User>({})
  const [isProfileOwner, setIsProfileOwner] = useState(false)
  const [membership, setMembership] = useState<DestinyMembership>({})
  const [guardians, setGuardians] = useState<Array<Guardian>>([])
  const [compState, setCompState] = useState(COMPSTATE.LOADING)
  
  const [displayName, setDisplayName] = useState<string>()
  
  // Forge user stuff
  const [forgeUser, setForgeUser] = useState<User>({})
  const [builds, setBuilds] = useState<BuildSummary[]>()
  const [privateBuilds, setPrivateBuilds] = useState<BuildSummary[]>()
  const [bookmarks, setBookmarks] = useState<BuildSummary[]>()
  const [about, setAbout] = useState<string>()
  const [facebookUrl, setFacebookUrl] = useState<string>()
  const [twitterUrl, setTwitterUrl] = useState<string>()
  const [youtubeUrl, setYoutubeUrl] = useState<string>()
  const [twitchUrl, setTwitchUrl] = useState<string>()
  const [tab, setTab] = useState<number>(1)

  useEffect(() => {
    if(!isConfigLoaded) return
    if(!isClientLoaded) return
    async function init() {
      setCompState(COMPSTATE.LOADING)

      let code = location.hash.replace("#", "")
      const { BungieApiService, ForgeClient, ForgeApiService } = window.services

      if(isLoggedIn && ForgeClient?.userData?.bungieNetUser?.uniqueName === `${username}#${code}`) {
        // This triggers a useEffect below that waits for login to complete
        setIsProfileOwner(true)
      } else {
        setIsProfileOwner(false)
        let searchRes: any;
        try {
          if(username) {
            searchRes = await BungieApiService.searchBungieNetUsers(username)
          }
        } catch (err) {
          dispatchAlert(BungieOfflineAlert)
          return
        }
  
        if(searchRes === undefined) {
          dispatchAlert(BungieOfflineAlert)
          return
        }
  
        // TODO: Handle this better
        if(searchRes && searchRes.length > 0) {
          // @ts-ignore
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
          let res: any;
          try {
            res = await BungieApiService.fetchCharactersList(membershipType, membershipId)
          } catch (err) {
            dispatchAlert(BungieOfflineAlert)
            return
          }
          if(res === undefined) {
            dispatchAlert(BungieOfflineAlert)
            return
          }
          if(res && res.characters && res.characters.data) {
            let guardians = Object.keys(res.characters.data).map(key => res.characters.data[key])
            if(guardians.length > 0) {
              // @ts-ignore
              guardians.sort((a: any, b: any) => new Date(b.dateLastPlayed) - new Date(a.dateLastPlayed))
              setGuardians(guardians)
              setCompState(COMPSTATE.DONE)
            } else {
              setCompState(COMPSTATE.NO_DATA)
            }
          }
        } else {
          console.warn("cant find that user")
        }
      }
    }
    init()
  }, [isConfigLoaded, username, dispatchAlert, isLoggedIn, location, isClientLoaded])

  // Profile owner
  useEffect(() => {
    if(!isUserDataLoaded) return
    if(!isProfileOwner) return
    if(!isLoggedIn) return
    const { ForgeClient } = window.services
    const { userData, userBuilds, userGuardians, userBookmarks, userInfo, userPrivateBuilds } = ForgeClient
    let fu: User = {
      user: userInfo,
      builds: userBuilds
    }
    // TODO: Move this logic into the ForgeClient
    let { membershipType, membershipId } = userUtils.parseMembershipFromProfile(userData)
    setMembership({ type: membershipType, id: membershipId })
    setForgeUser(fu)
    setDisplayName(ForgeClient.userData.bungieNetUser.uniqueName)
    setGuardians(userGuardians)
    if(userBookmarks) {
      let bm = Object.keys(userBookmarks).map(key => userBookmarks[key])
      setBookmarks([...bm])
    }
    if(userPrivateBuilds) {
      let pb = Object.keys(userPrivateBuilds).map(key => userPrivateBuilds[key])
      setPrivateBuilds(pb)
    }
    setCompState(COMPSTATE.DONE)
  }, [isLoggedIn, isProfileOwner, isUserDataLoaded])

  // sets the display name on a non-owner profile
  useEffect(() => {
    if(isProfileOwner) return
    if(user?.bungieGlobalDisplayName) {
      setDisplayName(`${user.bungieGlobalDisplayName}#${user.bungieGlobalDisplayNameCode}`)
    } else {
      setDisplayName("")
    }
  }, [user, isProfileOwner])

  // sets info for a forge user
  useEffect(() => {
    if(forgeUser?.builds && forgeUser.builds.length > 0) {
      setBuilds(forgeUser.builds)
    } else {
      setBuilds([])
    }
    if(forgeUser?.user?.about) {
      setAbout(forgeUser.user.about)
    } else {
      setAbout("")
    }
    if(forgeUser?.user?.social?.facebook) {
      setFacebookUrl(forgeUser.user.social.facebook)
    } else {
      setFacebookUrl("")
    }
    if(forgeUser?.user?.social?.twitch) {
      setTwitchUrl(forgeUser.user.social.twitch)
    } else {
      setTwitchUrl("")
    }
    if(forgeUser?.user?.social?.twitter) {
      setTwitterUrl(forgeUser.user.social.twitter)
    } else {
      setTwitterUrl("")
    }
    if(forgeUser?.user?.social?.youtube) {
      setYoutubeUrl(forgeUser.user.social.youtube)
    } else {
      setYoutubeUrl("")
    }
  }, [forgeUser])

  function goToGuardian(guardianId: string) {
    navigate(`/g/${membership.type}-${membership.id}-${guardianId}`)
  }

  return (
    <MainLayout>
      <Helmet>
        <title>GuardianForge</title>
      </Helmet>
      <div className="container">
        {compState === COMPSTATE.LOADING && (<Loading />)}

        {compState === COMPSTATE.NO_DATA && (
          <div>
            Unable to load this user's Guardians. Please check the username or try again later.
          </div>
        )}

        {compState === COMPSTATE.DONE && (
          <div className="flex flex-col">
            <UserProfileInfo
              displayName={displayName}
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
              {isProfileOwner && (
                <>
                  <TabItem onClick={() => setTab(3)} active={tab === 3}>
                    Private Builds
                  </TabItem>
                  <TabItem onClick={() => setTab(4)} active={tab === 4}>
                    Bookmarks
                  </TabItem>
                </>
              )}
            </TabGroup>
            {tab === 1 && (
              <div className="flex flex-col gap-2">
                {guardians && guardians.length > 0 && guardians.map((g: Guardian) => (
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
              <div className="grid md:grid-cols-3 gap-2">
                {(!forgeUser || forgeUser?.builds?.length === 0) && <div className="md:col-span-3 flex items-center justify-center">This user has no builds or is not registered with GuardianForge. Feel free to invite them! 😄</div>}
                {builds && builds.length > 0 && builds.map((bs: BuildSummary) => (
                  <BuildSummaryCard key={bs.id} buildSummary={bs} />
                ))}
              </div>
            )}

            {tab === 3 && (
              <div className="grid md:grid-cols-3 gap-2">
                {!(privateBuilds && privateBuilds.length > 0) && <div className="md:col-span-3 flex items-center justify-center text-neutral-400 italic">You have created any private builds yet...</div>}
                {privateBuilds && privateBuilds.length > 0 && privateBuilds.map((bs: BuildSummary) => (
                  <BuildSummaryCard key={bs.id} buildSummary={bs} />
                ))}
              </div>
            )}

            {tab === 4 && (
              <div className="grid md:grid-cols-3 gap-2">
                {!(bookmarks && bookmarks.length > 0) && <div className="md:col-span-3 flex items-center justify-center text-neutral-400 italic">You have not bookmarked any builds yet...</div>}
                {bookmarks && bookmarks.length > 0 && bookmarks.map((bs: BuildSummary) => (
                  <BuildSummaryCard key={bs.id} buildSummary={bs} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  )
}

export default UserProfile
