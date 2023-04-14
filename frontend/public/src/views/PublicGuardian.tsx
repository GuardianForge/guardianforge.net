import React, { useState, useEffect, useContext } from 'react'
import { GlobalContext } from '../contexts/GlobalContext'
import Loading from '../components/Loading'
import SubclassCard from '../components/SubclassCard'
import ItemCard from '../components/ItemCard'
import styled from 'styled-components'
import { classes } from '../constants'
import buildUtils from "../utils/buildUtils"
import { useNavigate, useParams } from 'react-router-dom'
import ActivitySelector from '../components/ActivitySelector'
import YouTubeEmbed from '../components/YouTubeEmbed'
import { Helmet } from 'react-helmet'
import StatBar from '../components/StatBar'
import BuildAd from '../components/ads/BuildAd'
import { Button, ButtonGroup, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { BungieOfflineAlert } from '../models/AlertDetail'
import User, { UserInfo } from '../models/User'
import ActivityOption from '../models/ActivityOption'
import MainLayout from '../layouts/MainLayout'
import ForgeButton from '../components/forms/Button'

const Wrapper = styled.div`
  .items {
    display: flex;
    flex-wrap: wrap;
  }

  .video-embed-placeholder {
    height: 200px;
    background-color: rgba(0,0,0,0.1);
    display: flex;
    justify-content: center;
    align-items: center;
    color: #aaa;
    font-style: italic;
    border-radius: 5px;
    margin-bottom: 5px;
    text-align: center;
  }

  @media (max-width: 576px) {
    h1, h2, h3 {
      text-align: center;
    }

    .guardian-header {
      flex-wrap: wrap;
    }

    .items {
      justify-content: center !important;
    }

    .stats {
      margin: 0 auto;
      max-width: 287px;

      img {
        margin: 3px;
      }
    }
  }
`

const COMP_STATE = {
  NONE: 0,
  LOADING: 1,
  DONE: 2,
  NO_DATA: 3,
  ERROR: 4,
  SAVING: 5
}

function Guardian() {
  const { guardianKey } = useParams()
  const navigate = useNavigate()
  const { isInitDone, isClientLoaded, dispatchAlert } = useContext(GlobalContext)
  const [compState, setCompState] = useState(COMP_STATE.LOADING)
  const [highlights, setHighlights] = useState<Array<string>>([])
  const [buildName, setBuildName] = useState("")
  const [buildNotes, setBuildNotes] = useState("")
  const [videoLink, setVideoLink] = useState("")
  const [inputStyle, setInputStyle] = useState("0")
  const [primaryActivity, setPrimaryActivity] = useState<ActivityOption>({
    value: "1",
    display: "Any Activity"
  })
  // TODO: dont use any
  const [items, setItems] = useState<any>({})
  const [stats, setStats] = useState({})
  const [isBuildModeActive, setIsBuildModeActive] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User>({})
  // TODO: dont use any
  const [characterData, setCharacterData] = useState<any>({})
  const [isSaving, setIsSaving] = useState(false)
  const [className, setClassName] = useState("")
  const [isPrivate, setIsPrivate] = useState(false)
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false)

  useEffect(() => {
    if(!isInitDone) {
      return
    }

    async function init() {
      const { BungieApiService, ManifestService, ForgeClient } = window.services

      if(ForgeClient.isLoggedIn()) {
        console.log("redirecting")
        navigate(`/app/g/${guardianKey}`)
      }

      // @ts-ignore TODO: check for null
      let split = guardianKey.split("-")
      let meta = {
        membershipType: split[0],
        membershipId: split[1],
        guardianId: split[2]
      }
      let res
      try {
        res = await Promise.all([
          BungieApiService.fetchCharacter(meta.membershipType, meta.membershipId, meta.guardianId),
          BungieApiService.fetchUserByMembershipAndPlatform(meta.membershipId, meta.membershipType)
        ])
      } catch (err) {
        dispatchAlert(BungieOfflineAlert)
        return
      }

      // User stuff
      const user = res[1]
      // TODO: dont use any
      let selectedUser: any = {}
      if(user.bungieNetUser) {
        selectedUser = {
          displayName: user.bungieNetUser.uniqueName,
          bungieNetUserId: user.bungieNetUser.membershipId
        }
      }

      if(!selectedUser.displayName) {
        if(user.destinyMemberships && user.destinyMemberships.length > 0)  {
          let { bungieGlobalDisplayName, bungieGlobalDisplayNameCode } = user.destinyMemberships[0]
          selectedUser = {
            displayName: `${bungieGlobalDisplayName}#${bungieGlobalDisplayNameCode}`
          }
        }
      }
      setSelectedUser(selectedUser)

      // Guardian stuff
      let characterData = res[0]
      let className = classes[characterData.character.classType]
      setClassName(className)

      let stats = buildUtils.lookupCharacterStats(characterData, ManifestService)
      setStats(stats)
      const excludedSocketCateogies = [
        "ARMOR COSMETICS",
        "ARMOR PERKS",
        "WEAPON COSMETICS",
        "ARMOR TIER"
      ]
      let items = buildUtils.lookupItemInstances(characterData, ManifestService, excludedSocketCateogies)
      setItems(items)

      setCharacterData(characterData)
      setBuildName(`${selectedUser.displayName}'s ${className}`)
      setCompState(COMP_STATE.DONE)
    }
    init()
  }, [isInitDone])

  useEffect(() => {
    if(!isClientLoaded) return
    function load() {
      const { ForgeClient } = window.services
      if(ForgeClient.isLoggedIn()) {
        setIsUserLoggedIn(true)
      }
    }
    load()
  }, [isClientLoaded])

  function onCancelClicked() {
    setBuildName(`${selectedUser.displayName}'s ${className}`)
    setBuildNotes("")
    setHighlights([])
    setIsBuildModeActive(false)
  }

  async function onSaveBuildClicked() {
    let { ForgeApiService, ForgeClient } = window.services

    // TODO: dont use any
    let build: any = {
      name: buildName,
      notes: buildNotes,
      class: characterData.character.classType,
      selectedUser,
      highlights,
      items,
      videoLink,
      stats
    }

    try {
      setIsSaving(true)
      if(inputStyle !== "0") {
        build.inputStyle = inputStyle
      }

      if(primaryActivity && primaryActivity.value !== "0") {
        build.primaryActivity = primaryActivity.value
      }

      let token;
      if(ForgeClient.isLoggedIn()) {
        token = ForgeClient.getToken()
        if(ForgeClient.userData && ForgeClient.userData.bungieNetUser && ForgeClient.userData.bungieNetUser && ForgeClient.userData.bungieNetUser.membershipId) {
          build.createdBy = ForgeClient.userData.bungieNetUser.membershipId
        }
      }

      if(isPrivate) {
        build.isPrivate = true
      }

      const buildId = await ForgeApiService.createBuild(build, token)
      navigate(`/build/${buildId}`)
    } catch(err) {
      // TODO: HANDLE
      console.error(err)
      setIsSaving(false)
    }
  }

  function updateHighlights(key: string) {
    let _highlights = highlights
    if(_highlights.find(el => el === key)) {
      _highlights = _highlights.filter(el => el !== key)
    } else {
      _highlights.push(key)
    }
    setHighlights([..._highlights])
  }

  function onActivityChanged(activity: ActivityOption) {
    setPrimaryActivity(activity)
  }

  return (
    <MainLayout>
      <Wrapper className={isBuildModeActive ? "build-mode" : ""}>
        <Helmet>
          <title>GuardianForge</title>
        </Helmet>
        {compState === COMP_STATE.LOADING && (<div className="mt-[20px]"> <Loading/> </div>)}
        {compState === COMP_STATE.DONE && (
          <div>
            <div className="guardian-header flex items-center justify-between">
              <h1>{selectedUser.displayName}'s {className}</h1>
              <div className="header-buttons">
                {!isBuildModeActive ? (
                  <ForgeButton onClick={() => setIsBuildModeActive(true)}>Create Build</ForgeButton>
                ) : (
                  <div className="flex gap-3">
                    <ForgeButton onClick={onCancelClicked} disabled={isSaving}>Cancel</ForgeButton>
                    <ForgeButton onClick={onSaveBuildClicked} disabled={isSaving}>Save Build</ForgeButton>
                  </div>
                )}
              </div>
            </div>
            {isBuildModeActive && (
              <div className="grid grid-cols-2 gap-3">
                <h2 className="col-span-2">Build Info</h2>

                <div>
                  <div className="flex flex-col mb-2">
                    <label className="font-bold">Name</label>
                    <div className="bg-white p-1 border border-gray-300 shadow text-black">
                      <input type="text"
                        value={buildName}
                        onChange={(e) => setBuildName(e.target.value)}
                        className="w-full border-transparent focus:border-transparent focus:ring-0 outline-none"
                        placeholder="Give your build a name" />
                    </div>
                  </div>
                  <div className="flex flex-col mb-2">
                    <label className="font-bold">Notes</label>
                    <div className="bg-white p-1 border border-gray-300 shadow text-black">
                      <textarea
                        value={buildNotes}
                        onChange={(e) => setBuildNotes(e.target.value)}
                        className="w-full border-transparent focus:border-transparent focus:ring-0 outline-none"
                        placeholder="Add notes about how to best use the build, what synergizes together, etc."
                        rows={5} />
                    </div>
                  </div>

                  <div className="flex flex-col mb-2">
                    <label className="font-bold">Primary Activity</label>
                    <ActivitySelector value={primaryActivity} onChange={onActivityChanged}/>
                  </div>

                  <div className="flex flex-col mb-2">
                    <label className="font-bold">Input Style</label>
                    <div className="bg-white p-1 border border-gray-300 shadow text-black">
                      <select value={inputStyle} onChange={e => setInputStyle(e.target.value)} id="inputStyle" className="w-full" >
                        <option value="0" disabled>Mouse/Keyboard or Controller</option>
                        <option value="1">Mouse/Keyboard</option>
                        <option value="2">Controller</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  {isUserLoggedIn && (
                    <div className="form-group mb-3">
                      <label htmlFor="buildVisibility" className="form-label">Visibility</label>
                      <br />
                      <ButtonGroup aria-label="Basic example">
                        <Button variant={isPrivate ? "secondary" : "primary"} onClick={() => {setIsPrivate(false)}}>
                          <FontAwesomeIcon icon="eye" />
                        </Button>
                        <Button variant={isPrivate ? "primary" : "secondary"} onClick={() => setIsPrivate(true)}>
                          <FontAwesomeIcon icon="eye-slash" />
                        </Button>
                      </ButtonGroup>
                      {isPrivate === true ? (
                        <label className="form-label">
                          <i className="mx-2">Private</i>
                          <OverlayTrigger
                            placement="bottom"
                            delay={{ show: 250, hide: 400 }}
                            overlay={<Tooltip>Private builds will not appear on the front page or in search, however anyone with the link can still view the build.</Tooltip>}>
                              <FontAwesomeIcon icon="info-circle" />
                            </OverlayTrigger>
                        </label>
                      ) : (
                        <label className="form-label mx-2">
                          <i>Public</i>
                        </label>
                      )}
                    </div>
                  )}
                  <div className="flex flex-col mb-2">
                    <label className="font-bold">YouTube Video</label>
                    <div className="bg-white p-1 border border-gray-300 shadow text-black">
                      <input type="text"
                      value={videoLink}
                      onChange={e => setVideoLink(e.target.value)}
                        className="w-full border-transparent focus:border-transparent focus:ring-0 outline-none"
                        placeholder="If you have a video link, paste it here" />
                    </div>
                  </div>
                  {videoLink ? (
                    <div>
                      <YouTubeEmbed youtubeUrl={videoLink} />
                    </div>
                  ) : (
                    <div className="video-embed-placeholder">
                      Paste a link above to preview the video.
                    </div>
                  )}
                </div>
              </div>
            )}

            <BuildAd />

            <StatBar stats={stats} highlights={highlights} onHighlightableClicked={updateHighlights} isHighlightable={isBuildModeActive} />

            <h4>Subclass</h4>
            <div className="grid grid-cols-1">
              {items.subclass && (<SubclassCard item={items.subclass} onHighlightableClicked={updateHighlights} highlights={highlights} isHighlightable={isBuildModeActive}/>)}
            </div>

            <h4>Weapons</h4>
            <div className="grid grid-cols-3 gap-2">
              {items.kinetic && (<ItemCard item={items.kinetic} onHighlightableClicked={updateHighlights} highlights={highlights} isHighlightable={isBuildModeActive}/>)}
              {items.energy && (<ItemCard item={items.energy} onHighlightableClicked={updateHighlights} highlights={highlights} isHighlightable={isBuildModeActive}  />)}
              {items.power && (<ItemCard item={items.power} onHighlightableClicked={updateHighlights} highlights={highlights} isHighlightable={isBuildModeActive}  />)}
            </div>

            <h4>Armor</h4>
            <div className="grid grid-cols-3 gap-2">
              {items.helmet && (<ItemCard item={items.helmet} onHighlightableClicked={updateHighlights} highlights={highlights} isHighlightable={isBuildModeActive}  />)}
              {items.arms && (<ItemCard item={items.arms} onHighlightableClicked={updateHighlights} highlights={highlights} isHighlightable={isBuildModeActive}  />)}
              {items.chest && (<ItemCard item={items.chest} onHighlightableClicked={updateHighlights} highlights={highlights} isHighlightable={isBuildModeActive}  />)}
              {items.legs && (<ItemCard item={items.legs} onHighlightableClicked={updateHighlights} highlights={highlights} isHighlightable={isBuildModeActive} />)}
              {items.classItem && (<ItemCard item={items.classItem} onHighlightableClicked={updateHighlights} highlights={highlights} isHighlightable={isBuildModeActive}  />)}
            </div>

            <BuildAd />
          </div>
        )}
      </Wrapper>
    </MainLayout>
  )
}

export default Guardian
