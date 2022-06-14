import { useState, useEffect, useContext } from 'react'
import styled from 'styled-components'
import { GlobalContext } from '../contexts/GlobalContext'
import Loading from "../components/Loading"
import SubclassCard from '../components/SubclassCard'
import ItemCard from '../components/ItemCard'
import { Helmet } from 'react-helmet'
import BuildAd from '../components/ads/BuildAd';
import StatBar from '../components/StatBar';
import BuildMetaPanel from '../components/BuildMetaPanel'
import { Alert } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { useParams } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'

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

function Build() {
  const navigate = useNavigate()
  const { buildId } = useParams()
  const { isConfigLoaded, dispatchAlert } = useContext(GlobalContext)
  const [loginUrl, setLoginUrl] = useState("")

  const [compState, setCompState] = useState(COMP_STATE.LOADING)
  // TODO: this shouldnt be any
  const [buildData, setBuildData] = useState<any>({})
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

      if(ForgeClient.config && ForgeClient.config.loginUrl) {
        setLoginUrl(ForgeClient.config.loginUrl)
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
  }, [isConfigLoaded, buildId, navigate])

  // TODO: This shouldnt be any
  function onBuildUpdated(updates: any) {
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

  function onBuildUpdateFailed() {
    dispatchAlert({
      title: "Updating Build Failed",
      body: "An error occurred while updating this build. Please try again later...",
      isError: true,
      autohide: false
    })
  }

  return (
    <MainLayout>
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
              Login with your Bungie account to unlock more features! <a href={loginUrl}>Login w/Bungie</a>.
            </Alert>
          </div>

            <h1>{ buildName }</h1>
            <BuildMetaPanel
              buildId={buildId as string}
              buildData={buildData}
              onBuildUpdated={onBuildUpdated}
              onBuildUpdateFailed={onBuildUpdateFailed} />

            <BuildAd />

            <StatBar stats={buildData.stats} highlights={highlights} />

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
          </div>
        )}
      </Wrapper>

    </MainLayout>
  )
}

export default Build
