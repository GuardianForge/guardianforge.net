import { useState, useEffect, useContext } from 'react'
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
import { faTwitter } from '@fortawesome/free-brands-svg-icons'
import { faLink, faEdit, faBox } from '@fortawesome/free-solid-svg-icons'
import BookmarkButton from '../components/BookmarkButton'
import ForgeButtonLink from '../components/forms/ButtonLink'
import ActivityOption from '../models/ActivityOption'
import ModalSelectorOption from '../models/ModalSelectorOption'
import ArchiveBuildModal from '../components/ArchiveBuildModal'
import BuildObj, { BuildItem } from '../models/Build'
import AlertDetail from '../models/AlertDetail'
import { COMP_STATE, activityOptions, inputStyleOptions } from '../constants'
import copy from "copy-to-clipboard";
import EditBuildModal, { UpdateBuildResponse } from '../components/EditBuildModal'
import { UserInfo } from '../models/User'
import { useHighlightsStore } from '../stores/highlights'

function Build() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { isConfigLoaded, dispatchAlert, isLoggedIn, isUserDataLoaded, isClientLoaded } = useContext(GlobalContext)
  const [loginUrl, setLoginUrl] = useState("")

  const [compState, setCompState] = useState(COMP_STATE.LOADING)
  const [buildData, setBuildData] = useState<any>({})

  // Stores
  const [setHighlights] = useHighlightsStore((state) => [
    state.setHighlights
  ])


  // Build meta
  const [buildId, setBuildId] = useState("")
  const [buildName, setBuildName] = useState("")
  // const [highlights, setHighlights] = useState([])
  const [notes, setNotes] = useState("")
  const [videoLink, setVideoLink] = useState("")
  const [twitterLink, setTwitterLink] = useState("")
  const [activity, setActivity] = useState<ActivityOption>(activityOptions[0])
  const [inputStyle, setInputStyle] = useState<ModalSelectorOption>({ value: "0", display: "None"})
  const [isOwner, setIsOwner] = useState(false)
  const [isArchived, setIsArchived] = useState(false)
  const [createdBy, setCreatedBy] = useState<UserInfo>()
  const [guardianOf, setGuardianOf] = useState<UserInfo>()

  // Modals
  const [displayLoginAlert, setDisplayLoginAlert] = useState(false)
  const [isArchiveBuildModalOpen, setIsArchiveBuildModalOpen] = useState(false)
  const [isEditBuildModalOpen, setIsEditBuildModalOpen] = useState(false)

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
    if(!id) return
    if(!isConfigLoaded) return
    setBuildId(id)

    async function init() {
      const { ForgeApiService, ForgeClient, BungieApiService } = window.services
      if(!isLoggedIn) {
        setDisplayLoginAlert(true)
      }
      if(ForgeClient.config && ForgeClient.config.loginUrl) {
        setLoginUrl(ForgeClient.config.loginUrl)
      }

      let buildData = await ForgeApiService.fetchBuild(id)
      setBuildData(buildData)

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
        setBuildName(`Build ${id}`)
      }

      if(buildData.notes) setNotes(buildData.notes)

      if(buildData.highlights) setHighlights(buildData.highlights)

      if(buildData.primaryActivity) {
        let activity = activityOptions.find(el => el.value === buildData.primaryActivity)
        if(activity && activity.value !== '1') {
          setActivity(activity)
        }
      }

      // setup twitter link
      let tweetText = "Check out this build I found on @guardianforge!"
      setTwitterLink(`https://twitter.com/intent/tweet?text=${tweetText}&url=${window.location.href}&hashtags=destiny2`)

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

      // Load created by
      if(buildData.createdBy) {
        let responses = await Promise.all([
          BungieApiService.fetchBungieUser(buildData.createdBy),
          ForgeApiService.fetchForgeUser(buildData.createdBy)
        ])
        let bungieUser = responses[0]
        let forgeUser = responses[0]
        if(bungieUser?.uniqueName) {
          let createdByUser: any = {
            uniqueName: bungieUser.uniqueName
          }

          if(forgeUser?.user?.social) {
            createdByUser.social = forgeUser.user.social
          }
          setCreatedBy(createdByUser)
        }
      }

      // Load guardian of
      if(buildData?.selectedUser?.bungieNetUserId) {
        let responses = await Promise.all([
          BungieApiService.fetchBungieUser(buildData.selectedUser.bungieNetUserId),
          ForgeApiService.fetchForgeUser(buildData.selectedUser.bungieNetUserId)
        ])
        let bungieUser = responses[0]
        let forgeUser = responses[1]
        if(bungieUser?.uniqueName) {
          let guardianOfUser: any = {
            uniqueName: bungieUser.uniqueName
          }
          if(forgeUser?.user?.social) {
            guardianOfUser.social = forgeUser.user.social
          }
          setGuardianOf(guardianOfUser)
        }
      }

      setCompState(COMP_STATE.DONE)
    }
    init()
  }, [isConfigLoaded, buildId, navigate])

  useEffect(() => {
    if(!isClientLoaded) return
    if(!isUserDataLoaded) return
    const { ForgeClient } = window.services
    if(isLoggedIn) {
      setDisplayLoginAlert(false)
      console.log('userBuilds', ForgeClient.userBuilds)
      if(ForgeClient?.userBuilds?.find((b: any) => b.id === buildId)) {
        setIsOwner(true)
      }
    }
  }, [buildId, isClientLoaded, isUserDataLoaded, isLoggedIn])

  function copyToClipboard() {
    copy(window.location.href)
    let a = new AlertDetail("Link copied to clipboard.", "Link Copied")
    dispatchAlert(a)
  }

  function copyDIMLink() {
    let b = Object.assign(new BuildObj(), buildData)
    let url = b.toDIMLink()
    copy(url)
    let a = new AlertDetail("DIM Link copied to clipboard.", "Link Copied")
    dispatchAlert(a)
  }

  function onBuildUpdated(updates: UpdateBuildResponse) {
    let _buildData = buildData

    if(updates.name) {
      _buildData.name = updates.name
      setBuildName(updates.name)
    }

    if(updates.notes) {
      _buildData.notes = updates.notes
      setNotes(updates.notes)
    }

    if(updates.primaryActivity) {
      let a = activityOptions.find((opt: ActivityOption) => opt.value === updates.primaryActivity)
      if(a) {
        _buildData.primaryActivity = updates.primaryActivity
        setActivity(a)
      }
    }

    if(updates.inputStyle) {
      let is = inputStyleOptions.find((opt: ModalSelectorOption) => opt.value === updates.inputStyle)
      if(is) {
        _buildData.inputStyle = updates.inputStyle
        setInputStyle(is)
      }
    }

    if(updates.videoLink) {
      _buildData.videoLink = updates.videoLink
      setVideoLink(updates.videoLink)
    }

    setBuildData(_buildData)
    setIsEditBuildModalOpen(false)
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
    setIsArchived(true)
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

              {!isArchived &&
                <BookmarkButton buildId={buildId} buildData={buildData} />
              }

              {isOwner && (
                <>
                  <ForgeButton onClick={() => setIsEditBuildModalOpen(true)}>
                    <FontAwesomeIcon icon={faEdit} /> Edit
                  </ForgeButton>
                  <ForgeButton onClick={() => setIsArchiveBuildModalOpen(true)}>
                    <FontAwesomeIcon icon={faBox} /> Archive
                  </ForgeButton>
                </>
              )}
            </div>

        <div className="flex items-center justify-center text-lg">
          <UpvoteButton
            buildId={buildId as string}
            buildData={buildData}
            isBuildArchived={isArchived} />
        </div>
      </div>
      {/* /Buttons */}
        <BuildMetaPanel
          primaryActivity={activity}
          createdBy={createdBy}
          guardianOf={guardianOf}
          notes={notes}
          inputStyle={inputStyle.value}
          videoLink={videoLink}
          className="mb-2" />

          <BuildAd />

          <h4>Stats</h4>
          <StatBar stats={buildData.stats} />

          <h4>Subclass</h4>
          <div className="subclass">
            {subclass && (<SubclassCard item={subclass} />)}
          </div>

          <h4>Weapons</h4>
          <div className="grid md:grid-cols-3 gap-2">
            {kinetic && (<ItemCard item={kinetic} />)}
            {energy && (<ItemCard item={energy} />)}
            {power && (<ItemCard item={power} />)}
          </div>

          <h4>Armor</h4>
          <div className="grid md:grid-cols-3 gap-2">
            {helmet && (<ItemCard item={helmet} />)}
            {arms && (<ItemCard item={arms} />)}
            {chest && (<ItemCard item={chest} />)}
            {legs && (<ItemCard item={legs} />)}
            {classItem && (<ItemCard item={classItem} />)}
          </div>

          <BuildAd />

          {/* Edit modal */}
          <EditBuildModal
            show={isEditBuildModalOpen}
            onHide={() => setIsEditBuildModalOpen(false)}
            buildId={buildId}
            name={buildName}
            notes={notes}
            videoLink={videoLink}
            activity={activity}
            inputStyle={inputStyle}
            onUpdateFailed={onBuildUpdateFailed}
            onUpdated={onBuildUpdated} />


          {/* Archive modal */}
          <ArchiveBuildModal
            buildId={buildId}
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
