import React, { useEffect, useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import GuardianCard from '../components/GuardianCard'
import Loading from '../components/Loading'
import { GlobalContext } from '../contexts/GlobalContext'
import userUtils from "../utils/userUtils"
import { Helmet } from 'react-helmet'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import BuildSummaryCard from '../components/BuildSummaryCard'
import User from '../models/User'
import DestinyMembership from '../models/DestinyMembership'
import Guardian from '../models/Guardian'
import { BungieOfflineAlert } from '../models/AlertDetail'
import { useLocation, useParams } from 'react-router-dom'
import { faFacebook, faTwitch, faTwitter, faYoutube } from '@fortawesome/free-brands-svg-icons'
import BuildSummary from '../models/BuildSummary'
import MainLayout from '../layouts/MainLayout'

const COMPSTATE = {
  LOADING: 1,
  DONE: 2,
  NO_DATA: 3
}

function PublicProfile() {
  const { username } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { isConfigLoaded, dispatchAlert } = useContext(GlobalContext)
  const [user, setUser] = useState<User>({})
  const [forgeUser, setForgeUser] = useState<User>({})
  const [membership, setMembership] = useState<DestinyMembership>({})
  const [guardians, setGuardians] = useState<Array<Guardian>>([])
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
          console.log('res', res)
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
    init()
  }, [isConfigLoaded])

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div className="bg-gray-800 rounded p-4 h-fit">
              <div>
                {user && (
                  <span className="text-2xl">
                    {user.bungieGlobalDisplayName}#{user.bungieGlobalDisplayNameCode}
                  </span>
                )}
                {forgeUser && forgeUser.user && (
                  <div>
                    {forgeUser.user.about && <span className="italic">"{ forgeUser.user.about }"</span>}
                    {forgeUser.user.social && (
                      <div className="flex gap-2 mt-4 mb-2 text-xl">
                        {forgeUser.user.social.twitter && (
                          <a href={forgeUser.user.social.twitter} className="hover:text-[#1da1f2]" target="_blank" rel="noreferrer">
                            <FontAwesomeIcon icon={faTwitter} />
                          </a>
                        )}
                        {forgeUser.user.social.twitch && (
                          <a href={forgeUser.user.social.twitch} className="hover:text-[#9146ff]" target="_blank" rel="noreferrer">
                            <FontAwesomeIcon icon={faTwitch} />
                          </a>
                        )}
                        {forgeUser.user.social.youtube && (
                          <a href={forgeUser.user.social.youtube} className="hover:text-[#ff0000]" target="_blank" rel="noreferrer">
                            <FontAwesomeIcon icon={faYoutube} />
                          </a>
                        )}
                        {forgeUser.user.social.facebook && (
                          <a href={forgeUser.user.social.facebook} className="hover:text-[#1877f2]" target="_blank" rel="noreferrer">
                            <FontAwesomeIcon icon={faFacebook} />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              {forgeUser && forgeUser.builds && forgeUser.builds.length > 0 && (
                <div className="border-t border-t-gray-600 flex flex-col gap-2 pt-2 text-lg">
                  <a className="text-gray-200 hover:text-white hover:cursor-pointer" onClick={() => setAreBuildsShown(false)}>
                    Guardians
                  </a>
                  <a className="text-gray-200 hover:text-white hover:cursor-pointer" onClick={() => setAreBuildsShown(true)}>
                    Builds
                  </a>
                </div>
              )}
            </div>

            {areBuildsShown ? (
              <div className="grid col-span-2 md:grid-cols-2 gap-3">
                {forgeUser.builds && forgeUser.builds.map((bs: BuildSummary) => (
                  <BuildSummaryCard key={bs.id} buildSummary={bs} isPublicUi />
                ))}
              </div>
            ) : (
              <div className="col-span-2">
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
    </MainLayout>
  )
}

export default PublicProfile
