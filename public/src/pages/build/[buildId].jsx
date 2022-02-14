import React, { useState, useEffect, useContext } from 'react'
import styled from 'styled-components'
import { GlobalContext } from '../../contexts/GlobalContext'
import Loading from "../../components/Loading"
import SubclassCard from '../../components/build/SubclassCard'
import ItemCard from '../../components/build/ItemCard'
import { Helmet } from 'react-helmet'
import BuildAd from '../../components/ads/BuildAd';
import StatBar from '../../components/build/StatBar';
import BuildMetaPanel from '../../components/build/BuildMetaPanel'
import { Alert } from 'react-bootstrap'
import { Link, navigate } from 'gatsby'

const Wrapper = styled.div`
  @media (max-width: 576px) {
    h1, h2, h3 {
      text-align: center
    }
  }
`

const COMP_STATE = {
  LOADING: 0,
  DONE: 1,
  ERROR: 2
}

function Build({ buildId }) {
  const { isConfigLoaded, dispatchAlert } = useContext(GlobalContext)
  const [compState, setCompState] = useState(COMP_STATE.LOADING)
  const [buildData, setBuildData] = useState({})
  const [buildName, setBuildName] = useState("")
  const [highlights, setHighlights] = useState([])

  useEffect(() => {
    if(!isConfigLoaded) {
      return
    }
    async function init() {
      const { ForgeApiService, ForgeClient } = window.services

      if(ForgeClient.isLoggedIn()) {
        navigate(`/app/build/${buildId}`)
      }

      let buildData = await ForgeApiService.fetchBuild(buildId)

      if(buildData.name) {
        setBuildName(buildData.name)
      } else {
        setBuildData(`Build ${buildId}`)
      }

      if(buildData.notes) {
        buildData.notes = buildData.notes.replace(/\n/g, "<br/>")
      }

      if(buildData.highlights) {
        setHighlights(buildData.highlights)
      }

      setBuildData(buildData)
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
        <div id="build">

        <div style={{ marginTop: "15px" }}>
          <Alert>
            A new GuardianForge is coming! Read more about it <Link to="/blog/a-new-guardianforge-is-coming">here</Link>.
          </Alert>
        </div>

          <h1>{ buildName }</h1>
          <BuildMetaPanel
            buildId={buildId}
            buildData={buildData}
            onBuildUpdated={onBuildUpdated}
            onBuildUpdateFailed={onBuildUpdateFailed} />

          <BuildAd />

          <h3>Stats</h3>
          <StatBar stats={buildData.stats} highlights={highlights} />

          <h3>Subclass</h3>
          <div className="subclass row">
            {buildData.items.subclass && (<SubclassCard className="col-md-12" item={buildData.items.subclass} highlights={highlights}/>)}
          </div>

          <h3>Weapons</h3>
          <div className="weapons row">
            {buildData.items.kinetic && (<ItemCard className="col-md-4" item={buildData.items.kinetic} highlights={highlights} />)}
            {buildData.items.energy && (<ItemCard className="col-md-4" item={buildData.items.energy} highlights={highlights}  />)}
            {buildData.items.power && (<ItemCard className="col-md-4" item={buildData.items.power} highlights={highlights}  />)}
          </div>

          <h3>Armor</h3>
          <div className="armor row">
            {buildData.items.helmet && (<ItemCard className="col-md-4" item={buildData.items.helmet} highlights={highlights}  />)}
            {buildData.items.arms && (<ItemCard className="col-md-4" item={buildData.items.arms} highlights={highlights}  />)}
            {buildData.items.chest && (<ItemCard className="col-md-4" item={buildData.items.chest} highlights={highlights}  />)}
            {buildData.items.legs && (<ItemCard className="col-md-4" item={buildData.items.legs} highlights={highlights}  />)}
            {buildData.items.classItem && (<ItemCard className="col-md-4" item={buildData.items.classItem} highlights={highlights}  />)}
          </div>

          <BuildAd />

        </div>
      )}
    </Wrapper>
  )
}

export default Build
