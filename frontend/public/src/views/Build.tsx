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
import UpvoteButton from '../components/UpvoteButton'
import ForgeButton from '../components/forms/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTwitter, faYoutube } from '@fortawesome/free-brands-svg-icons'
import { faLink, faEdit, faBox, faCube, faStickyNote } from '@fortawesome/free-solid-svg-icons'
import BookmarkButton from '../components/BookmarkButton'
import ForgeButtonLink from '../components/forms/ButtonLink'
import ActivitySelector from '../components/ActivitySelector'
import ForgeModal from '../components/Modal'
import YouTubeEmbed from '../components/YouTubeEmbed'
import Input from '../components/forms/Input'
import ModalSelector from '../components/forms/ModalSelector'
import TextArea from '../components/forms/TextArea'
import ActivityOption from '../models/ActivityOption'
import ModalSelectorOption from '../models/ModalSelectorOption'
import ArchiveBuildModal from '../components/ArchiveBuildModal'
import { BuildItem } from '../models/Build'
import AlertDetail from '../models/AlertDetail'

const COMP_STATE = {
  LOADING: 0,
  DONE: 1,
  ERROR: 2,
  SAVING: 3
}

function Build() {
  const navigate = useNavigate()
  const { buildId } = useParams()
  const { isConfigLoaded, dispatchAlert } = useContext(GlobalContext)
  const [loginUrl, setLoginUrl] = useState("")

  const [compState, setCompState] = useState(COMP_STATE.LOADING)
  // TODO: this shouldnt be any
  // const [buildData, setBuildData] = useState<any>({})
  const [buildName, setBuildName] = useState("")
  const [highlights, setHighlights] = useState([])
  const [notes, setNotes] = useState("")
  const [videoLink, setVideoLink] = useState("")

  // Modals
  const [displayLoginAlert, setDisplayLoginAlert] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isArchiveBuildModalOpen, setIsArchiveBuildModalOpen] = useState(false)

  // Build items
  const [subclass, setSubclass] = useState<BuildItem>()
  const [kinetic, setKinetic] = useState<BuildItem>()
  const [energy, setEnergy] = useState<BuildItem>()
  const [power, setPower] = useState<BuildItem>()
  const [helmet, setHelmet] = useState<BuildItem>()
  const [arms, setArms] = useState<BuildItem>()
  const [chest, setChest] = useState<BuildItem>()
  const [legs, setLegs] = useState<BuildItem>()
  const [classItem, setClassItem] = useState<BuildItem>()


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

      // Extract items
      if(buildData?.items?.subclass) setSubclass(buildData.items.subclass)
      if(buildData?.items?.kinetic) setKinetic(buildData.items.kinetic)
      if(buildData?.items?.energy) setEnergy(buildData.items.energy)
      if(buildData?.items?.power) setPower(buildData.items.power)
      if(buildData?.items?.helmet) setHelmet(buildData.items.helmet)
      if(buildData?.items?.arms) setArms(buildData.items.arms)
      if(buildData?.items?.chest) setChest(buildData.items.chest)
      if(buildData?.items?.legs) setLegs(buildData.items.legs)
      if(buildData?.items?.classItem) setClassItem(buildData.items.classItem)

      if(buildData.name) {
        setBuildName(buildData.name)
      } else {
        setBuildName(`Build ${buildId}`)
      }

      if(buildData.notes) {
        buildData.notes = buildData.notes.replace(/\n/g, "<br/>")
      }

      if(buildData.highlights) {
        setHighlights(buildData.highlights)
      }


    if(buildData.primaryActivity) {
      let activity = activityOptions.find(el => el.value === buildData.primaryActivity)
      if(activity && activity.value !== '1') {
        setPrimaryActivity(activity)
      }
    }

    // setup twitter link
    let tweetText = "Check out this build I found on @guardianforge!"
    setTwitterLink(`https://twitter.com/intent/tweet?text=${tweetText}&url=${window.location.href}&hashtags=destiny2`)

    if(buildData.name) {
      setName(buildData.name)
    }

    if(buildData.videoLink) setVideoLink(buildData.videoLink)

    if(buildData.primaryActivity) {
      let a = activityOptions.find((opt: ActivityOption) => opt.value === buildData.primaryActivity)
      if(a) {
        setActivity(a)
      }
    }

    if(buildData.inputStyle) {
      let is = inputStyleOptions.find((opt: ModalSelectorOption) => opt.value === buildData.inputStyle)
      if(is) {
        setInputStyle(is)
      }
    }

      setBuildData(buildData)
      setCompState(COMP_STATE.DONE)
    }
    init()
  }, [isConfigLoaded, buildId, navigate])

  function copyToClipboard() {
    copy(window.location.href)
    let a = new AlertDetail("Link copied to clipboard.", "Link Copied")
    dispatchAlert(a)
  }

  function copyDIMLink() {
    let b = Object.assign(new Build(), buildData)
    let url = b.toDIMLink()
    copy(url)
    let a = new AlertDetail("DIM Link copied to clipboard.", "Link Copied")
    dispatchAlert(a)
  }

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

  function onBuildArchived() {
    setIsOwner(false)
    setIsBuildArchived(true)
  }

  function onBuildArchiveError() {
    dispatchAlert({
      title: "Archiving Build",
      body: "An error occurred while archiving this build. Please try again later...",
      isError: true,
      autohide: false,
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
          <div className='flex items-center justify-between'>
            <h1 className='text-2xl'>{ buildName }</h1>
          </div>
          {/* Buttons */}
          <div className="flex flex-col md:flex-row md:items-center mb-2 gap-2">
            <div className="grid grid-cols-2 md:flex md:flex-row flex-1 items-center gap-1">
              <ForgeButton onClick={copyToClipboard}>
                <FontAwesomeIcon icon={faLink} />
                Copy Link
              </ForgeButton>

              <ForgeButtonLink href={twitterLink} target="_blank" rel="noreferrer">
                <FontAwesomeIcon icon={faTwitter} /> Share
              </ForgeButtonLink>

              <ForgeButton onClick={copyDIMLink} className="px-3">
                  <img src="/img/dim-logo.svg" className="max-h-[16px]" alt="DIM Logo" /> DIM&nbsp;Link
              </ForgeButton>

              {!isBuildArchived &&
                <BookmarkButton buildId={buildId} buildData={buildData} />
              }

              {isOwner && (
                <>
                  <ForgeButton onClick={() => setIsEditing(true)}>
                    <FontAwesomeIcon icon={faEdit} /> Edit
                  </ForgeButton>
                  <ForgeButton onClick={() => setIsArchiveModalDisplayed(true)}>
                    <FontAwesomeIcon icon={faBox} /> Archive
                  </ForgeButton>
                </>
              )}
            </div>

        <div className="flex items-center justify-center text-lg">
          <UpvoteButton
            buildId={buildId as string}
            buildData={buildData}
            isBuildArchived={isBuildArchived} />
        </div>
      </div>
      {/* /Buttons */}
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
            {subclass && (<SubclassCard item={subclass} highlights={highlights}/>)}
          </div>

          <h4>Weapons</h4>
          <div className="grid md:grid-cols-3 gap-2">
            {kinetic && (<ItemCard item={kinetic} highlights={highlights} />)}
            {energy && (<ItemCard item={energy} highlights={highlights}  />)}
            {power && (<ItemCard item={power} highlights={highlights}  />)}
          </div>

          <h4>Armor</h4>
          <div className="grid md:grid-cols-3 gap-2">
            {helmet && (<ItemCard item={helmet} highlights={highlights}  />)}
            {arms && (<ItemCard item={arms} highlights={highlights}  />)}
            {chest && (<ItemCard item={chest} highlights={highlights}  />)}
            {legs && (<ItemCard item={legs} highlights={highlights}  />)}
            {classItem && (<ItemCard item={classItem} highlights={highlights}  />)}
          </div>

          <BuildAd />

          {/* Edit modal */}
          <ForgeModal
            show={isEditing}
            onHide={() => setIsEditing(false)}
            title="Edit Build Info"
            size="lg"
            footer={
              <div className="flex gap-1">
                <ForgeButton disabled={isSaving} onClick={() => setIsEditing(false)}>Cancel</ForgeButton>
                <ForgeButton disabled={isSaving} style={{marginLeft: "10px"}} onClick={() => saveBuild()}>Save</ForgeButton>
              </div>
            }>
            <div className="build-info-card mb-3">
              <span>Name</span>
              <Input
                prefixIcon={faCube}
                placeholder='Give your build a name'
                value={name}
                onChange={(e: any) => setName(e.target.value)}
                className="mb-3" />
              <span>Notes</span>
              <TextArea
                className="mb-3"
                prefixIcon={faStickyNote}
                rows={10}
                placeholder="Add some notes on how to use the build"
                value={notes}
                onChange={(e: any) => setNotes(e.target.value)}/>
              <span>Primary Activity</span>
              <ActivitySelector
                className="mb-3"
                value={activity}
                onChange={(opt: ActivityOption) => setActivity(opt)} />
              <span>Input Style</span>
              <ModalSelector
                title="Input Style"
                className="mb-3"
                options={inputStyleOptions}
                value={inputStyle}
                onChange={(opt: ModalSelectorOption) => setInputStyle(opt)} />
            </div>
            <h4>Video Review</h4>
            <div className="build-info-card">
              <Input
                prefixIcon={faYoutube}
                placeholder="Add a YouTube link"
                value={videoLink}
                className="mb-3"
                onChange={(e: any) => setVideoLink(e.target.value)} />
              <YouTubeEmbed youtubeUrl={videoLink} showPlaceholder />
            </div>
          </ForgeModal>


          {/* Archive modal */}
          <ArchiveBuildModal
            buildId={buildId as string}
            show={isArchiveBuildModalOpen}
            onHide={() => setIsArchiveBuildModalOpen(false)}
            onArchived={onBuildArchived}
            onArchiveError={onBuildArchiveError} />

        </div>
      )}

    </MainLayout>
  )
}

export default Build
