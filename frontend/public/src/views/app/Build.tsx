// @ts-nocheck

import React, { useState, useEffect, useContext } from 'react'
import styled from 'styled-components'
import { GlobalContext } from '../../contexts/GlobalContext'
import Loading from "../../components/Loading"
import SubclassCard from '../../components/SubclassCard'
import ItemCard from '../../components/ItemCard'
import { Helmet } from 'react-helmet'
import BuildAd from '../../components/ads/BuildAd';
import StatBar from '../../components/StatBar';
import { Col, Container, Row } from 'react-bootstrap'
import CommandsBar from '../../components/CommandsBar'
import User from '../models/User'
import PlayerInfoCard from '../../components/PlayerInfoCard'
import BuildNotesCard from '../../components/BuildNotesCard'
import VideoReviewCard from '../../components/VideoReviewCard'
import BuildData from '../../models/Build'
import { useParams } from 'react-router-dom'
import AppLayout from '../../layouts/AppLayout'

const Wrapper = styled.div`
  /* margin: 0px 10px; */
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

function Build(props: Props) {
  const { buildId } = useParams()

  const { isConfigLoaded, setPageTitle, isInitDone } = useContext(GlobalContext)
  const [compState, setCompState] = useState(COMP_STATE.LOADING)
  const [buildData, setBuildData] = useState<BuildData>({})
  const [highlights, setHighlights] = useState([])
  const [isOwner, setIsOwner] = useState(false)
  const [guardianOf, setGuardianOf] = useState<User>()
  const [createdBy, setCreatedBy] = useState<User>()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if(!isInitDone) return
    async function checkOwner() {
      const { ForgeClient } = window.services

      if(ForgeClient.isAdmin()) {
        setIsAdmin(true)
      }

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
      } else {
        const name = `Build ${buildId}`
        setPageTitle(name)
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

  function onBuildUpdated(updates: BuildData) {
    setCompState(COMP_STATE.LOADING)
    let _buildData = buildData

    if(updates.name) {
      _buildData.name = updates.name
      setPageTitle(updates.name)
    }

    if(updates.notes) {
      _buildData.notes = updates.notes
    }

    if(updates.inputStyle) {
      _buildData.inputStyle = updates.inputStyle
    }

    if(updates.primaryActivity) {
      _buildData.primaryActivity = updates.primaryActivity
    }

    if(updates.videoLink) {
      _buildData.videoLink = updates.videoLink
    }

    setBuildData(_buildData)
    setCompState(COMP_STATE.DONE)
  }

  return (
    <AppLayout>
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
                <CommandsBar buildId={buildId} buildData={buildData} isOwner={isOwner} onBuildUpdated={onBuildUpdated} isAdmin={isAdmin} />
              </Col>
            </Row>
            <Row>
              {(buildData.inputStyle || buildData.notes !== "" || buildData.primaryActivity != "1") && (
                <Col md="8" className="d-block d-xxl-none">
                  <BuildNotesCard notes={buildData.notes} inputStyle={buildData.inputStyle} primaryActivityKey={buildData.primaryActivity} />
                </Col>
              )}
              {(createdBy || guardianOf || buildData.videoLink) && (
                <Col md="4" className="d-block d-xxl-none">
                  {(createdBy || guardianOf) && (
                    <PlayerInfoCard createdBy={createdBy} guardianOf={guardianOf} />
                  )}
                  {buildData.videoLink && (
                    <VideoReviewCard youtubeUrl={buildData.videoLink} />
                  )}
                </Col>
              )}
              <Col xl="12" xxl="8">
                <BuildAd />

                <StatBar stats={buildData.stats} highlights={buildData.highlights} />

                <h4>Subclass</h4>
                <div className="subclass row">
                  {buildData.items.subclass && (<SubclassCard className="col-md-12" item={buildData.items.subclass} highlights={highlights}/>)}
                </div>

                <h4>Weapons</h4>
                <div className="weapons row">
                  {buildData.items.kinetic && (<ItemCard className="col-xs-12 col-md-6 col-lg-4" item={buildData.items.kinetic} highlights={highlights} />)}
                  {buildData.items.energy && (<ItemCard className="col-xs-12 col-md-6 col-lg-4" item={buildData.items.energy} highlights={highlights}  />)}
                  {buildData.items.power && (<ItemCard className="col-xs-12 col-md-6 col-lg-4" item={buildData.items.power} highlights={highlights}  />)}
                </div>

                <h4>Armor</h4>
                <div className="armor row">
                  {buildData.items.helmet && (<ItemCard className="col-xs-12 col-md-6 col-lg-4" item={buildData.items.helmet} highlights={highlights}  />)}
                  {buildData.items.arms && (<ItemCard className="col-xs-12 col-md-6 col-lg-4" item={buildData.items.arms} highlights={highlights}  />)}
                  {buildData.items.chest && (<ItemCard className="col-xs-12 col-md-6 col-lg-4" item={buildData.items.chest} highlights={highlights}  />)}
                  {buildData.items.legs && (<ItemCard className="col-xs-12 col-md-6 col-lg-4" item={buildData.items.legs} highlights={highlights}  />)}
                  {buildData.items.classItem && (<ItemCard className="col-xs-12 col-md-6 col-lg-4" item={buildData.items.classItem} highlights={highlights}  />)}
                </div>
                <BuildAd />
              </Col>
              <Col xxl="4" className="d-none d-xxl-block">
                {/* TODO: Fix this, still displays if its all empty */}
                {(buildData.inputStyle !== "" || buildData.notes !== "" || buildData.primaryActivity !== "1") && (
                  <BuildNotesCard notes={buildData.notes} inputStyle={buildData.inputStyle} primaryActivityKey={buildData.primaryActivity} />
                )}
                {(createdBy || guardianOf) && <PlayerInfoCard createdBy={createdBy} guardianOf={guardianOf} />}
                {buildData.videoLink && <VideoReviewCard youtubeUrl={buildData.videoLink} />}
              </Col>
            </Row>
          </Container>
        )}
      </Wrapper>
    </AppLayout>
  )
}

export default Build
