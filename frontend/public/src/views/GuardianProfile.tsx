import { useState, useEffect, useContext } from 'react'
import { GlobalContext } from '../contexts/GlobalContext'
import Loading from '../components/Loading'
import SubclassCard from '../components/SubclassCard'
import ItemCard from '../components/ItemCard'
import { classes } from '../constants'
import buildUtils from "../utils/buildUtils"
import { Helmet } from 'react-helmet'
import StatBar from '../components/StatBar'
import BuildAd from '../components/ads/BuildAd'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import User from '../models/User'
import { BuildItemCollection } from '../models/Build'
import ButtonBar from '../components/forms/ButtonBar'
import copy from "copy-to-clipboard";
import { faCube, faLink } from '@fortawesome/free-solid-svg-icons'
import { useNavigate, useParams } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import ForgeButton from '../components/forms/Button'
import AlertDetail from '../models/AlertDetail'
import { useHighlightsStore } from '../stores/buildstore'

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

  const { isInitDone, dispatchAlert } = useContext(GlobalContext)
  const [compState, setCompState] = useState(COMP_STATE.LOADING)
  const [items, setItems] = useState<BuildItemCollection>({})
  const [stats, setStats] = useState({})
  const [guardianName, setGuardianName] = useState<string>()

  const [setHighlights] = useHighlightsStore(state => [
    state.setHighlights
  ])

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

      // Guardian stuff
      let characterData = res[0]
      let className = classes[characterData.character.classType]

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

      // Just in case there are any keys in the store yet
      setHighlights([])

      setCompState(COMP_STATE.DONE)
    }
    init()
  }, [isInitDone])


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
            <StatBar className="mb-2" stats={stats} />

            <h4>Subclass</h4>
            <div className="mb-2">
              {items.subclass && (<SubclassCard item={items.subclass} />)}
            </div>

            <h4>Weapons</h4>
            <div className="grid md:grid-cols-3 gap-2 mb-2">
              {items.kinetic && (<ItemCard item={items.kinetic}  />)}
              {items.energy && (<ItemCard item={items.energy} />)}
              {items.power && (<ItemCard item={items.power} />)}
            </div>

            <h4>Armor</h4>
            <div className="grid md:grid-cols-3 gap-2 mb-2">
              {items.helmet && (<ItemCard item={items.helmet} />)}
              {items.arms && (<ItemCard item={items.arms} />)}
              {items.chest && (<ItemCard item={items.chest} />)}
              {items.legs && (<ItemCard item={items.legs} />)}
              {items.classItem && (<ItemCard item={items.classItem} />)}
            </div>

            <BuildAd />
          </div>
        )}
      </div>
    </MainLayout>
  )
}

export default Guardian
