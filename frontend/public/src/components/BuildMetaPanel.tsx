import { useContext, useEffect, useState } from 'react'
import copy from "copy-to-clipboard";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import UpvoteButton from './UpvoteButton';
import BookmarkButton from './BookmarkButton';
import YouTubeEmbed from './YouTubeEmbed';
import activityOptions from '../utils/activityOptions'
import styled from 'styled-components';
import { GlobalContext } from '../contexts/GlobalContext';
import ForgeModal from './Modal'
import { Link } from 'react-router-dom'
import Build from '../models/Build';
import AlertDetail from '../models/AlertDetail';
import colors from '../colors';
import ForgeButton from './forms/Button';
import { UserInfo } from '../models/User';
import ActivityOption from '../models/ActivityOption';
import { faFacebook, faTwitch, faTwitter, faYoutube } from '@fortawesome/free-brands-svg-icons';
import { faBan, faBox, faCube, faEdit, faLink, faSave, faStickyNote } from '@fortawesome/free-solid-svg-icons';
import Card from './ui/Card';
import ForgeButtonLink from './forms/ButtonLink';
import ModalSelector from './forms/ModalSelector';
import ActivitySelector from './ActivitySelector';
import TextArea from './forms/TextArea';
import Input from './forms/Input';
import ModalSelectorOption from '../models/ModalSelectorOption';
import BuildSummary from '../models/BuildSummary';

const Wrapper = styled.div`
  .dim-btn {
    background-color: inherit !important;
    border-radius: 0 !important;
    border: none !important;
    img {
      width: 16px;
      height: 16px;
    }
  }

  .build-info-header {
    padding-top: 2px;
    font-weight: bold;
  }

  .build-info-icons {
    display: flex;
    img {
      max-width: 50px;
    }
  }

  .share-bar {
    border-bottom: 1px solid ${colors.theme2.dark1};
    margin-bottom: 5px;

    button {
      color: #eee;

      &:hover {
        color: #888;
      }
    }

    a {
      color: #eee;

      &:hover {
        color: #888;
      }
    }

    .btn-twitter {
      background-color: inherit !important;
      border-radius: 0 !important;
    }

    &-buttons {
      display: flex;
      justify-content: space-between;

      svg {
        margin-right: 3px;
      }

      &-left {
        display: flex;
      }
    }
  }

  @media (max-width: 576px) {
    .share-bar {
      &-buttons {
        max-width: 287px;
        display: flex;
        flex-direction: column;
        text-align: left;
        align-items: flex-start;

        &-left {
          flex-direction: column;
          justify-content: flex-start;
        }

        .btn {
          width: 100%;
          padding-top: 10px;
          padding-bottom: 10px;
          text-align: left;
        }
      }
    }
  }
`

const ForgeUserInfoWrapper = styled.div`
  span {
    font-style: italic;
    font-size: 16px;
  }

  svg {
    font-size: 20px;
    margin-right: 5px;
    margin-top: 5px;
  }

  a {
    color: #ddd;
  }

  .twitter-link:hover {
    color: #1da1f2;
  }

  .twitch-link:hover {
    color: #9146ff;
  }

  .youtube-link:hover {
    color: #ff0000;
  }

  .facebook-link:hover {
    color: #1877f2;
  }
`

type Props = {
  buildId: string
  buildData: Build
  onBuildUpdated?: Function
  onBuildUpdateFailed?: Function
  className?: string
}

function BuildMetaPanel(props: Props) {
  const { buildId, buildData, onBuildUpdated, onBuildUpdateFailed, className } = props

  const { isConfigLoaded, isUserDataLoaded, dispatchAlert } = useContext(GlobalContext)
  const [twitterLink, setTwitterLink] = useState("")
  const [primaryActivity, setPrimaryActivity] = useState<ActivityOption>()
  const [isOwner, setIsOwner] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isArchiveModalDisplayed, setIsArchiveModalDisplayed] = useState(false)
  const [isBuildArchived, setIsBuildArchived] = useState(false)
  const [createdBy, setCreatedBy] = useState<UserInfo>()
  const [guardianOf, setGuardianOf] = useState<UserInfo>()
  const [displayNotes, setDisplayNotes] = useState<string>()
  const [areNotesLong, setAreNotesLong] = useState(false)
  const [isNotesDialogDisplayed, setIsNotesDialogDisplayed] = useState(false)
  const [reformattedNotes, setReformattedNotes] = useState("")

  useEffect(() => {
    if (!isUserDataLoaded) return
    async function init() {
      const { ForgeClient } = window.services
      // @ts-ignore TODO: dont use any
      if(ForgeClient.userBuilds && ForgeClient.userBuilds.find(b => b.id === buildId)) {
        setIsOwner(true)
      }
    }
    init()
  }, [isUserDataLoaded, buildId])

  useEffect(() => {
    if(!isConfigLoaded) return
    async function load() {
      const { ForgeApiService, BungieApiService } = window.services
      // TODO: Optimize this, if they are the same ID
      if(buildData) {
        if(buildData.selectedUser && buildData.selectedUser.bungieNetUserId) {
          let guardianOfBungieUser = await BungieApiService.fetchBungieUser(buildData.selectedUser.bungieNetUserId)
          let guardianOfForgeUser = await ForgeApiService.fetchForgeUser(buildData.selectedUser.bungieNetUserId)
          if(guardianOfBungieUser) {
            let guardianOfUser: any = {
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
            let createdByUser: any = {
              uniqueName: createdByBungieUser.uniqueName
            }

            if(createdByForgeUser && createdByForgeUser.user.social) {
              createdByUser.social = createdByForgeUser.user.social
            }
            setCreatedBy(createdByUser)
          }
        }
      }
    }
    load()
  }, [isConfigLoaded, buildData])

  useEffect(() => {
    const { notes } = buildData

    if(notes) {
      let reformatted = notes.replace(/\n/g, "<br/>")
      setReformattedNotes(reformatted)
      if(notes.length > 500) {
        setDisplayNotes(reformatted.slice(0, 499) + "...")
        setAreNotesLong(true)
      } else {
        setDisplayNotes(reformatted)
      }
      setNotes(notes)
    }

    if(buildData.primaryActivity) {
      let activity = activityOptions.find(el => el.value === buildData.primaryActivity)
      if(activity && activity.value !== '1') {
        setPrimaryActivity(activity)
      }
    }

    // setup twitter link
    let tweetText = "Checkout this build I found on @guardianforge!"
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
  }, [buildData])

  function copyToClipboard() {
    copy(window.location.href)
    let a = new AlertDetail("Link copied to clipboard.", "Link Copied")
    dispatchAlert(a)
  }

  async function archiveBuild() {
    let { ForgeClient, ForgeApiService } = window.services
    try {
      let token = ForgeClient.getToken()
      await ForgeApiService.archiveBuild(buildId, token)
      // @ts-ignore TODO: dont use any
      ForgeClient.userBuilds = ForgeClient.userBuilds.filter(b => b.id !== buildId)
      setIsOwner(false)
      setIsBuildArchived(true)
    } catch (err) {
      dispatchAlert({
        title: "Archiving Build",
        body: "An error occurred while archiving this build. Please try again later...",
        isError: true,
        autohide: false,
      })
    } finally {
      setIsArchiveModalDisplayed(false)
    }
  }

  function copyDIMLink() {
    let b = Object.assign(new Build(), buildData)
    let url = b.toDIMLink()
    copy(url)
    let a = new AlertDetail("DIM Link copied to clipboard.", "Link Copied")
    dispatchAlert(a)
  }

  const [name, setName] = useState("")
  const [notes, setNotes] = useState("")
  const [videoLink, setVideoLink] = useState("")
  const [activity, setActivity] = useState<ActivityOption>({ value: "1", display: "Any Activity" })
  const [inputStyle, setInputStyle] = useState<ModalSelectorOption>({ value: "0", display: "None"})
  const [isSaving, setIsSaving] = useState(false)
  const inputStyleOptions: Array<ModalSelectorOption> = [
    {
      iconUrl: "/img/input-icons/mnk.png",
      value: "1",
      display: "Mouse & Keyboard"
    },
    {
      iconUrl: "/img/input-icons/controller.png",
      value: "2",
      display: "Controller"
    }
  ]

  async function saveBuild() {
    try {
      setIsSaving(true)
      let updates = {
        name,
        notes,
        primaryActivity: activity.value,
        inputStyle: inputStyle.value,
        videoLink
      }

      let { ForgeClient, ForgeApiService } = window.services
      let token = ForgeClient.getToken()
      await ForgeApiService.updateBuild(buildId, updates, token)

      // Update cache
      ForgeClient.userBuilds.forEach((b: BuildSummary) => {
        if(b.id === buildId) {
          b.name = name
        }
      })
      setIsEditing(false)

      if(onBuildUpdated) {
        onBuildUpdated(updates)
      }
    } catch (err) {
      dispatchAlert({
        title: "Updating Build",
        body: "An error occurred while updating this build. Please try again later...",
        isError: true,
        autohide: false,
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Wrapper className={className}>

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

          <BookmarkButton buildId={buildId} buildData={buildData} />

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

        <div className="flex items-center">
          <UpvoteButton buildId={buildId} buildData={buildData} isBuildArchived={isBuildArchived} />
        </div>
      </div>
      {/* /Buttons */}

      {/* Info */}
      <Card className='grid md:grid-cols-3 gap-2'>
        <div>
          {displayNotes && (
            <div>
              <span className="build-info-header">Notes</span>
              {displayNotes && <div dangerouslySetInnerHTML={{__html: displayNotes}} />}
              {areNotesLong && <a href="#" className="read-more-link" onClick={() => setIsNotesDialogDisplayed(true)}>Read more</a>}
              {/* <div className="build-notes" dangerouslySetInnerHTML={{ __html: buildData.notes }} /> */}
            </div>
          )}

          {(primaryActivity || buildData.inputStyle) && (<div className="build-info-header mt-3">Works Best With</div>)}
          <div className="build-info-icons">
            {primaryActivity && <img src={primaryActivity.iconUrl} alt="Primary Activity Icon" />}
            {buildData.inputStyle === '1' && (<img src="/img/input-icons/mnk.png" alt="Mouse and Keyboard" />)}
            {buildData.inputStyle === '2' && (<img src="/img/input-icons/controller.png" alt="Controller" />)}
          </div>
        </div>



        {buildData.videoLink && (
          <div>
            <div className="build-info-header">Video Review</div>
            <YouTubeEmbed youtubeUrl={buildData.videoLink} />
          </div>
        )}

        {(createdBy || guardianOf) && (
          <div>
            {createdBy && (
              <div className="created-by">
                <div className="build-info-header">Created By</div>
                <ForgeUserInfoWrapper>
                  <span>
                    <Link to={`/u/${createdBy.uniqueName}`}>{ createdBy.uniqueName }</Link>
                  </span>
                  {createdBy.social && (
                    <div className="socials">
                      {createdBy.social.twitter && (
                        <a href={createdBy.social.twitter} className="twitter-link" target="_blank" rel="noreferrer">
                          <FontAwesomeIcon icon={faTwitter} />
                        </a>
                      )}
                      {createdBy.social.twitch && (
                        <a href={createdBy.social.twitch} className="twitch-link" target="_blank" rel="noreferrer">
                          <FontAwesomeIcon icon={faTwitch} />
                        </a>
                      )}
                      {createdBy.social.youtube && (
                        <a href={createdBy.social.youtube} className="youtube-link" target="_blank" rel="noreferrer">
                          <FontAwesomeIcon icon={faYoutube} />
                        </a>
                      )}
                      {createdBy.social.facebook && (
                        <a href={createdBy.social.facebook} className="facebook-link" target="_blank" rel="noreferrer">
                          <FontAwesomeIcon icon={faFacebook} />
                        </a>
                      )}
                    </div>
                  )}
                </ForgeUserInfoWrapper>
              </div>
            )}
            {guardianOf && (
              <div className="guardian-of">
                <div className="build-info-header">Guardian Of</div>
                <ForgeUserInfoWrapper>
                  <span>
                    <Link to={`/u/${guardianOf.uniqueName}`}>{ guardianOf.uniqueName }</Link>
                  </span>
                  {guardianOf.social && (
                    <div className="socials">
                      {guardianOf.social.twitter && (
                        <a href={guardianOf.social.twitter} className="twitter-link" target="_blank" rel="noreferrer">
                          <FontAwesomeIcon icon={faTwitter} />
                        </a>
                      )}
                      {guardianOf.social.twitch && (
                        <a href={guardianOf.social.twitch} className="twitch-link" target="_blank" rel="noreferrer">
                          <FontAwesomeIcon icon={faTwitch} />
                        </a>
                      )}
                      {guardianOf.social.youtube && (
                        <a href={guardianOf.social.youtube} className="youtube-link" target="_blank" rel="noreferrer">
                          <FontAwesomeIcon icon={faYoutube} />
                        </a>
                      )}
                      {guardianOf.social.facebook && (
                        <a href={guardianOf.social.facebook} className="facebook-link" target="_blank" rel="noreferrer">
                          <FontAwesomeIcon icon={faFacebook} />
                        </a>
                      )}
                    </div>
                  )}
                </ForgeUserInfoWrapper>
              </div>
            )}
          </div>
        )}

      </Card>

      {/* Archive modal */}
      <ForgeModal show={isArchiveModalDisplayed} title="Archive Build" footer={
        <div className="flex gap-1">
          <ForgeButton onClick={() => setIsArchiveModalDisplayed(false)}>Cancel</ForgeButton>
          <ForgeButton onClick={() => archiveBuild()}>Archive</ForgeButton>
        </div>
      }>
        <p>
          Archiving a build will do the following:
        </p>
        <ul>
          <li>Remove from "My Builds"</li>
          <li>Remove from search & other public build lists</li>
          <li>Remove upvote & ownership information</li>
        </ul>
        <p>Direct links & bookmarks will still be valid. </p>
        <p><b>This operation CANNOT be undone.</b></p>
      </ForgeModal>

      {/* Build notes modal */}
      <ForgeModal show={isNotesDialogDisplayed} title="Build Notes" size="lg" scrollable footer={<ForgeButton onClick={() => setIsNotesDialogDisplayed(false)}>Close</ForgeButton>}>
        <>
          {reformattedNotes && <div dangerouslySetInnerHTML={{__html: reformattedNotes}} />}
        </>
      </ForgeModal>

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
    </Wrapper>
  )
}

export default BuildMetaPanel
