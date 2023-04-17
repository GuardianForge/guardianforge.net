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
  const [displayLoginAlert, setDisplayLoginAlert] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isArchiveBuildModalOpen, setIsArchiveBuildModalOpen] = useState(false)

  useEffect(() => {
    if(!isConfigLoaded) {
      return
    }
    async function init() {
      const { ForgeApiService, ForgeClient } = window.services

      if(!ForgeClient.isLoggedIn()) {
        setDisplayLoginAlert(true)
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
      // TODO: edit this to make it work?
      _buildData.notes = updates.notes
    }

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
      <Helmet>
        <title>GuardianForge</title>
      </Helmet>
      {compState === COMP_STATE.LOADING && <Loading />}
      {compState === COMP_STATE.DONE && (
        <div id="build" className="flex flex-col gap-2 mb-2">

          {displayLoginAlert && (
            <div style={{ marginTop: "15px" }}>
              <Alert>
                Login with your Bungie account to unlock more features! <a className="border-b border-b-blue-400" href={loginUrl}>Login w/Bungie</a>.
              </Alert>
            </div>
          )}

          <h1 className='flex justify-start'>{ buildName }</h1>
          <BuildMetaPanel
            buildId={buildId as string}
            buildData={buildData}
            onBuildUpdated={onBuildUpdated}
            onBuildUpdateFailed={onBuildUpdateFailed}
            className="mb-2" />

          <BuildAd />

          <h4>Stats</h4>
          <StatBar stats={buildData.stats} highlights={highlights} />

          <h4>Subclass</h4>
          <div className="subclass">
            {buildData.items.subclass && (<SubclassCard className="col-md-12" item={buildData.items.subclass} highlights={highlights}/>)}
          </div>

          <h4>Weapons</h4>
          <div className="grid md:grid-cols-3 gap-2">
            {buildData.items.kinetic && (<ItemCard item={buildData.items.kinetic} highlights={highlights} />)}
            {buildData.items.energy && (<ItemCard item={buildData.items.energy} highlights={highlights}  />)}
            {buildData.items.power && (<ItemCard item={buildData.items.power} highlights={highlights}  />)}
          </div>

          <h4>Armor</h4>
          <div className="grid md:grid-cols-3 gap-2">
            {buildData.items.helmet && (<ItemCard item={buildData.items.helmet} highlights={highlights}  />)}
            {buildData.items.arms && (<ItemCard item={buildData.items.arms} highlights={highlights}  />)}
            {buildData.items.chest && (<ItemCard item={buildData.items.chest} highlights={highlights}  />)}
            {buildData.items.legs && (<ItemCard item={buildData.items.legs} highlights={highlights}  />)}
            {buildData.items.classItem && (<ItemCard item={buildData.items.classItem} highlights={highlights}  />)}
          </div>

          <BuildAd />
        </div>
      )}

    </MainLayout>
  )
}

export default Build
