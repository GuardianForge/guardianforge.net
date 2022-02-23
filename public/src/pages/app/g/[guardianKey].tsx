import React, { useState, useEffect, useContext } from 'react'
// @ts-ignore
import { GlobalContext } from '../../../contexts/GlobalContext'
import Loading from '../../../components/app/Loading'
import SubclassCard from '../../../components/app/SubclassCard'
import ItemCard from '../../../components/app/ItemCard'
import styled from 'styled-components'
// @ts-ignore
import { classes } from '../../../constants'
// @ts-ignore
import buildUtils from "../../../utils/buildUtils"
import { navigate } from 'gatsby'
import { Helmet } from 'react-helmet'
import StatBar from '../../../components/app/StatBar'
import BuildAd from '../../../components/app/ads/BuildAd'
import { Button, Col, Container, OverlayTrigger, Row, Tooltip } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import User from '../../../models/User'
import { BuildItemCollection } from '../../../models/Build'
import ButtonBar from '../../../components/app/forms/ButtonBar'
import copy from "copy-to-clipboard";
import { faCube, faLink, faThumbsUp } from '@fortawesome/free-solid-svg-icons'
import Card from '../../../components/app/ui/Card'

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

type Props = {
  guardianKey: string
}

function Guardian(props: Props) {
  const { guardianKey } = props

  const { isInitDone, isClientLoaded, setPageTitle } = useContext(GlobalContext)
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

  useEffect(() => {
    if(!isInitDone) {
      return
    }

    async function init() {
      const { BungieApiService, ManifestService } = window.services
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

      setPageTitle(`${selectedUser.displayName}'s ${className}`)

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

      console.log(characterData, items)
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
    copy(`${location.origin}/g/${guardianKey}`)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 3000)
  }

  function onCreateBuildClicked() {
    navigate("/app/create-build", {
      state: {
        guardianKey
      }
    })
  }

  return (
    <Wrapper>
      <Helmet>
        <title>GuardianForge</title>
      </Helmet>
      {compState === COMP_STATE.LOADING && (<div style={{ marginTop: "20px" }}> <Loading/> </div>)}
      {compState === COMP_STATE.DONE && (
        <Container>
          <Row>
            <Col>
              <ButtonBar>
                <Button onClick={copyToClipboard}>
                  {isCopied ? (
                    <FontAwesomeIcon icon={faThumbsUp} />
                  ) : (
                    <FontAwesomeIcon icon={faLink} />
                  )}
                  Copy Link
                </Button>
                <Button onClick={onCreateBuildClicked}>
                  <FontAwesomeIcon icon={faCube} /> Create Build
                </Button>
              </ButtonBar>
            </Col>
          </Row>
          <Row>
            <Col md="12">
              <BuildAd />
              <StatBar stats={stats} highlights={highlights}/>

              <h4>Subclass</h4>
              <div className="items subclass row">
                {items.subclass && (<SubclassCard item={items.subclass} highlights={highlights}/>)}
              </div>

              <h4>Weapons</h4>
              <div className="items weapons row">
                {items.kinetic && (<ItemCard className="col-xxl-4 col-xl-6" item={items.kinetic} highlights={highlights} />)}
                {items.energy && (<ItemCard className="col-xxl-4 col-xl-6" item={items.energy} highlights={highlights}  />)}
                {items.power && (<ItemCard className="col-xxl-4 col-xl-6" item={items.power} highlights={highlights}  />)}
              </div>

              <h4>Armor</h4>
              <div className="items armor row">
                {items.helmet && (<ItemCard className="col-xxl-4 col-xl-6" item={items.helmet} highlights={highlights}  />)}
                {items.arms && (<ItemCard className="col-xxl-4 col-xl-6" item={items.arms} highlights={highlights}  />)}
                {items.chest && (<ItemCard className="col-xxl-4 col-xl-6" item={items.chest} highlights={highlights}  />)}
                {items.legs && (<ItemCard className="col-xxl-4 col-xl-6" item={items.legs} highlights={highlights}  />)}
                {items.classItem && (<ItemCard className="col-xxl-4 col-xl-6" item={items.classItem} highlights={highlights}  />)}
              </div>

              <BuildAd />
            </Col>
{/*
            <Col md="4">
              <Card title="User Info">
                User info here
              </Card>
            </Col> */}
          </Row>
        </Container>
      )}
    </Wrapper>
  )
}

export default Guardian
