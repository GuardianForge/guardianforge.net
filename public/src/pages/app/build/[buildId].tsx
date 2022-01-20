// @ts-nocheck

import React, { useState, useEffect, useContext } from 'react'
import styled from 'styled-components'
// @ts-ignore
import { GlobalContext } from '../../../contexts/GlobalContext'
import Loading from "../components/Loading"
import SubclassCard from '../../../components/build/SubclassCard'
import ItemCard from '../../../components/build/ItemCard'
import { Helmet } from 'react-helmet'
import BuildAd from '../../../components/ads/BuildAd';
import StatBar from '../../../components/build/StatBar';
import BuildMetaPanel from '../../../components/build/BuildMetaPanel'
import { Col, Container, Row } from 'react-bootstrap'
import CommandsBar from '../components/CommandsBar'

const Wrapper = styled.div`
  @media (max-width: 576px) {
    h1, h2, h3 {
      text-align: center
    }
  }

  .build-notes {
    font-style: italic;
  }
`

const COMP_STATE = {
  LOADING: 0,
  DONE: 1,
  ERROR: 2
}

type Props = {
  buildId: string
}

function Build(props: Props) {
  const { buildId } = props

  const { isConfigLoaded, dispatchAlert, setPageTitle, isInitDone } = useContext(GlobalContext)
  const [compState, setCompState] = useState(COMP_STATE.LOADING)
  const [buildData, setBuildData] = useState({})
  const [buildName, setBuildName] = useState("")
  const [highlights, setHighlights] = useState([])
  const [isOwner, setIsOwner] = useState(false)
  const [guardianOf, setGuardianOf] = useState()
  const [createdBy, setCreatedBy] = useState()

  useEffect(() => {
    if(!isInitDone) return
    async function checkOwner() {
      const { ForgeClient } = window.services

      if(ForgeClient.userBuilds && ForgeClient.userBuilds.find(b => b.id === buildId)) {
        setIsOwner(true)
      }
    }
    checkOwner()
  }, [isInitDone])

  useEffect(() => {
    if(!isConfigLoaded) return
    async function init() {
      const { ForgeApiService, BungieApiService } = window.services

      let buildData = await ForgeApiService.fetchBuild(buildId)

      if(buildData.name) {
        setPageTitle(buildData.name)
        setBuildName(buildData.name)
      } else {
        const name = `Build ${buildId}`
        setPageTitle(name)
        setBuildName(name)
      }

      if(buildData.notes) {
        buildData.notes = buildData.notes.replace(/\n/g, "<br/>")
      }

      if(buildData.highlights) {
        setHighlights(buildData.highlights)
      }

      setBuildData(buildData)

      // TODO: Optimize this
      if(buildData.selectedUser && buildData.selectedUser.bungieNetUserId) {
        let guardianOfBungieUser = await BungieApiService.fetchBungieUser(buildData.selectedUser.bungieNetUserId)
        let guardianOfForgeUser = await ForgeApiService.fetchForgeUser(buildData.selectedUser.bungieNetUserId)
        if(guardianOfBungieUser) {
          let guardianOfUser = {
            uniqueName: guardianOfBungieUser.uniqueName
          }

          if(guardianOfForgeUser && guardianOfForgeUser.user.social) {
            guardianOfUser.social = guardianOfForgeUser.user.social
          }
          console.log(guardianOfUser)
          setGuardianOf(guardianOfUser)
        }
      }

      if(buildData.createdBy) {
        let createdByBungieUser = await BungieApiService.fetchBungieUser(buildData.createdBy)
        let createdByForgeUser = await ForgeApiService.fetchForgeUser(buildData.createdBy)
        if(createdByBungieUser) {
          let createdByUser = {
            uniqueName: createdByBungieUser.uniqueName
          }

          if(createdByForgeUser && createdByForgeUser.user.social) {
            createdByUser.social = createdByForgeUser.user.social
          }
          setCreatedBy(createdByUser)
        }
      }

      setCompState(COMP_STATE.DONE)
    }
    init()
  }, [isConfigLoaded])

  function onBuildUpdated(updates) {
    let _buildData = buildData

    if(updates.name) {
      _buildData.name = updates.name
      setBuildName(updates.name)
    }

    if(updates.notes) {
      _buildData.notes = updates.notes
    }

    console.log(updates)

    setBuildData(_buildData)
  }

  function onBuildUpdateFailed(error) {
    dispatchAlert({
      title: "Updating Build Failed",
      body: "An error occurred while updating this build. Please try again later...",
      isError: true,
      autohide: false,
      // buttons: [
      //   {
      //     title: "Report",
      //     fn: function () {
      //       console.log("reported!")
      //     }
      //   }
      // ]
    })
  }

  return (
    <Wrapper>
      <Helmet>
        <title>GuardianForge</title>
      </Helmet>
      {compState === COMP_STATE.LOADING && (
        <div className="row mt-3">
          <Loading />
        </div>
      )}
      {compState === COMP_STATE.DONE && (
        <Container fluid id="build">
          <Row>
            <Col md="12">
              <CommandsBar buildId={buildId} buildData={buildData} isOwner={isOwner} />
            </Col>
          </Row>
          <Row>
            <Col md="9">
              <div className="build-notes" dangerouslySetInnerHTML={{__html: buildData.notes}} />
              <BuildAd />

              <h4>Subclass</h4>
              <div className="subclass row">
                {buildData.items.subclass && (<SubclassCard className="col-md-12" item={buildData.items.subclass} highlights={highlights}/>)}
              </div>

              <h4>Weapons</h4>
              <div className="weapons row">
                {buildData.items.kinetic && (<ItemCard className="col-md-4" item={buildData.items.kinetic} highlights={highlights} />)}
                {buildData.items.energy && (<ItemCard className="col-md-4" item={buildData.items.energy} highlights={highlights}  />)}
                {buildData.items.power && (<ItemCard className="col-md-4" item={buildData.items.power} highlights={highlights}  />)}
              </div>

              <h4>Armor</h4>
              <div className="armor row">
                {buildData.items.helmet && (<ItemCard className="col-md-4" item={buildData.items.helmet} highlights={highlights}  />)}
                {buildData.items.arms && (<ItemCard className="col-md-4" item={buildData.items.arms} highlights={highlights}  />)}
                {buildData.items.chest && (<ItemCard className="col-md-4" item={buildData.items.chest} highlights={highlights}  />)}
                {buildData.items.legs && (<ItemCard className="col-md-4" item={buildData.items.legs} highlights={highlights}  />)}
                {buildData.items.classItem && (<ItemCard className="col-md-4" item={buildData.items.classItem} highlights={highlights}  />)}
              </div>
              <BuildAd />
            </Col>
            <Col md="3">
              sidebar

            </Col>
          </Row>

          {/* <BuildMetaPanel
            buildId={buildId}
            buildData={buildData}
            onBuildUpdated={onBuildUpdated}
            onBuildUpdateFailed={onBuildUpdateFailed} /> */}



        </Container>
      )}
    </Wrapper>
  )
}

export default Build
