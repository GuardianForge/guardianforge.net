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
  // TODO: dont use any
  const [items, setItems] = useState<any>({})
  const [stats, setStats] = useState({})
  const [selectedUser, setSelectedUser] = useState<User>({})
  const [className, setClassName] = useState("")

  useEffect(() => {
    if(!isInitDone) {
      return
    }

    async function init() {
      const { BungieApiService, ManifestService } = window.services

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

      setCompState(COMP_STATE.DONE)
    }
    init()
  }, [isInitDone])

  function onCreateBuildClicked() {
    navigate(`/create-build?guardianKey=${guardianKey}`)
  }

  return (
    <MainLayout>
      <Wrapper>
        <Helmet>
          <title>GuardianForge</title>
        </Helmet>
        {compState === COMP_STATE.LOADING && (<div className="mt-[20px]"> <Loading/> </div>)}
        {compState === COMP_STATE.DONE && (
          <div>
            <div className="guardian-header flex items-center justify-between">
              <h1>{selectedUser.displayName}'s {className}</h1>
              <div className="header-buttons">
                <ForgeButton onClick={onCreateBuildClicked}>Create Build</ForgeButton>
              </div>
            </div>

            <BuildAd />

            <StatBar stats={stats} />

            <h4>Subclass</h4>
            <div className="grid grid-cols-1">
              {items.subclass && (<SubclassCard item={items.subclass} />)}
            </div>

            <h4>Weapons</h4>
            <div className="grid grid-cols-3 gap-2">
              {items.kinetic && (<ItemCard item={items.kinetic} />)}
              {items.energy && (<ItemCard item={items.energy} />)}
              {items.power && (<ItemCard item={items.power} />)}
            </div>

            <h4>Armor</h4>
            <div className="grid grid-cols-3 gap-2">
              {items.helmet && (<ItemCard item={items.helmet} />)}
              {items.arms && (<ItemCard item={items.arms} />)}
              {items.chest && (<ItemCard item={items.chest} />)}
              {items.legs && (<ItemCard item={items.legs} />)}
              {items.classItem && (<ItemCard item={items.classItem} />)}
            </div>

            <BuildAd />
          </div>
        )}
      </Wrapper>
    </MainLayout>
  )
}

export default Guardian
