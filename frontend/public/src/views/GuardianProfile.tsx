import { useState, useEffect, useContext } from 'react'
import { GlobalContext } from '../contexts/GlobalContext'
import Loading from '../components/Loading'
import SubclassCard from '../components/SubclassCard'
import ItemCard from '../components/ItemCard'
import styled from 'styled-components'
import { classes } from '../constants'
import buildUtils from "../utils/buildUtils"
import { Helmet } from 'react-helmet'
import StatBar from '../components/StatBar'
import BuildAd from '../components/ads/BuildAd'
import { Button, Col, Container, Row } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import User from '../models/User'
import { BuildItemCollection } from '../models/Build'
import ButtonBar from '../components/forms/ButtonBar'
import copy from "copy-to-clipboard";
import { faCube, faLink, faThumbsUp } from '@fortawesome/free-solid-svg-icons'
import { useNavigate, useParams } from 'react-router-dom'
import AppLayout from '../layouts/AppLayout'
import MainLayout from '../layouts/MainLayout'
import ForgeButton from '../components/forms/Button'
import AlertDetail from '../models/AlertDetail'

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
    h1, h2, h4 {
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
  const [highlights, setHighlights] = useState([])
  const [items, setItems] = useState<BuildItemCollection>({})
  const [stats, setStats] = useState({})
  const [isBuildModeActive, setIsBuildModeActive] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User>()
  const [characterData, setCharacterData] = useState({})
  const [isSaving, setIsSaving] = useState(false)
  const [className, setClassName] = useState("")
  const [isPrivate, setIsPrivate] = useState(false)
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [guardianName, setGuardianName] = useState<string>()

  useEffect(() => {
    if(!isInitDone) {
      return
    }

    async function init() {
      const { BungieApiService, ManifestService } = window.services
      // @ts-ignore TODO: fix me
      let split = guardianKey.split("-")
      let meta = {
        membershipType: split[0],
        membershipId: split[1],
        guardianId: split[2]
      }
      let res = await Promise.all([
        BungieApiService.fetchCharacter(meta.membershipType, meta.membershipId, meta.guardianId),
        BungieApiService.fetchUserByMembershipAndPlatform(meta.membershipId, meta.membershipType)
      ])

      // User stuff
      const user = res[1]
      let selectedUser: User = {}
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

      setGuardianName(`${selectedUser.displayName}'s ${className}`)

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


  function copyToClipboard() {
    copy(`${window.location.origin}/g/${guardianKey}`)
    let a = new AlertDetail("Link copied to clipboard.", "Link Copied")
    dispatchAlert(a)
  }

  function onCreateBuildClicked() {
    navigate(`/create-build?guardianKey=${guardianKey}`)
  }

  return (
    <MainLayout wide>
      <div>
        <Helmet>
          <title>GuardianForge</title>
        </Helmet>
        {compState === COMP_STATE.LOADING && (<div style={{ marginTop: "20px" }}> <Loading/> </div>)}
        {compState === COMP_STATE.DONE && (
          <div>
            <div className='flex flex-col md:flex-row gap-2 border-b border-b-neutral-800 md:border-none mb-2'>
              <h1 className="flex-1 text-2xl font-bold">{ guardianName }</h1>
              <ButtonBar>
                <ForgeButton onClick={copyToClipboard}>
                  <FontAwesomeIcon icon={faLink} /> Copy Link
                </ForgeButton>
                <ForgeButton onClick={onCreateBuildClicked}>
                  <FontAwesomeIcon icon={faCube} /> Create Build
                </ForgeButton>
              </ButtonBar>
            </div>
            <BuildAd />

            <h4>Stats</h4>
            <StatBar className="mb-2" stats={stats} highlights={highlights}/>

            <h4>Subclass</h4>
            <div className="mb-2">
              {items.subclass && (<SubclassCard item={items.subclass} highlights={highlights}/>)}
            </div>

            <h4>Weapons</h4>
            <div className="grid md:grid-cols-3 gap-2 mb-2">
              {items.kinetic && (<ItemCard item={items.kinetic} highlights={highlights} />)}
              {items.energy && (<ItemCard item={items.energy} highlights={highlights}  />)}
              {items.power && (<ItemCard item={items.power} highlights={highlights}  />)}
            </div>

            <h4>Armor</h4>
            <div className="grid md:grid-cols-3 gap-2 mb-2">
              {items.helmet && (<ItemCard item={items.helmet} highlights={highlights}  />)}
              {items.arms && (<ItemCard item={items.arms} highlights={highlights}  />)}
              {items.chest && (<ItemCard item={items.chest} highlights={highlights}  />)}
              {items.legs && (<ItemCard item={items.legs} highlights={highlights}  />)}
              {items.classItem && (<ItemCard item={items.classItem} highlights={highlights}  />)}
            </div>

            <BuildAd />
          </div>
        )}
      </div>
    </MainLayout>
  )
}

export default Guardian
