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
import { Button } from "react-bootstrap"
import Build from '../models/Build';
import AlertDetail from '../models/AlertDetail';
import colors from '../colors';
import ForgeButton from './forms/Button';
import { UserInfo } from '../models/User';
import ActivityOption from '../models/ActivityOption';
import { faFacebook, faTwitch, faTwitter, faYoutube } from '@fortawesome/free-brands-svg-icons';
import { faBan, faBox, faEdit, faLink, faSave } from '@fortawesome/free-solid-svg-icons';

const Wrapper = styled.div`
  background-color: ${colors.theme2.dark2};
  border-radius: 5px;
  margin: 5px;
  padding-bottom: 10px;

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
    margin: 5px 30px !important;

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
}

function BuildMetaPanel(props: Props) {
  const { buildId, buildData, onBuildUpdated, onBuildUpdateFailed } = props

  const { isConfigLoaded, isUserDataLoaded, dispatchAlert } = useContext(GlobalContext)
  const [twitterLink, setTwitterLink] = useState("")
  const [primaryActivity, setPrimaryActivity] = useState<ActivityOption>()
  const [isCopied, setIsCopied] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [buildName, setBuildName] = useState<string>()
  const [buildNotes, setBuildNotes] = useState<string>()
  const [isArchiveModalDisplayed, setIsArchiveModalDisplayed] = useState(false)
  const [isBuildArchived, setIsBuildArchived] = useState(false)
  const [createdBy, setCreatedBy] = useState<UserInfo>()
  const [guardianOf, setGuardianOf] = useState<UserInfo>()
  const [columns, setColumns] = useState(2)
  const [displayNotes, setDisplayNotes] = useState<string>()
  const [areNotesLong, setAreNotesLong] = useState(false)
  const [isNotesDialogDisplayed, setIsNotesDialogDisplayed] = useState(false)
  const [reformattedNotes, setReformattedNotes] = useState("")

  useEffect(() => {
    let _cols = 1
    if(buildData) {
      if(buildData.videoLink) {
        _cols++
      }
      if(buildData.createdBy || (buildData.selectedUser && buildData.selectedUser.bungieNetUserId)) {
        _cols++
      }
    }
    setColumns(_cols)
  }, [buildData])

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
  }, [buildData])

  function copyToClipboard() {
    copy(window.location.href)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 3000)
  }

  function editBuild() {
    let notes = ""
    if(buildData.notes) {
      notes = buildData.notes.replace(/<br\/>/g, "\n")
    }
    setBuildName(buildData.name)
    setBuildNotes(notes)
    setIsEditing(true)
  }

  function cancelEditBuild() {
    setBuildName("")
    setBuildNotes("")
    setIsEditing(false)
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

  async function updateBuild() {
    try {
      // TODO: dont use any
      let updates: any = {
        name: buildName
      }
      if (buildNotes) {
        updates.notes = buildNotes.replace(/\n/g, "<br/>")
      }

      if(onBuildUpdated) {
        onBuildUpdated(updates)
      }
      setIsEditing(false)

      let { ForgeClient, ForgeApiService } = window.services
      let token = ForgeClient.getToken()
      await ForgeApiService.updateBuild(buildId, updates, token)

      // Update cache
      // @ts-ignore TODO: Fix this
      ForgeClient.userBuilds.forEach(b => {
        if(b.id === buildId) {
          b.name = buildName
        }
      })
    } catch (err) {
      if(onBuildUpdateFailed) {
        onBuildUpdateFailed(err)
      }
    }
  }

  function copyDIMLink() {
    let b = Object.assign(new Build(), buildData)
    let url = b.toDIMLink()
    copy(url)
    let a = new AlertDetail("DIM Link copied to clipboard.", "Link Copied")
    dispatchAlert(a)
  }

  return (
    <Wrapper className="row">
      <div className="share-bar col-md-12">

        <div className="flex flex-col md:flex-row">
          <div className="flex flex-col md:flex-row flex-1 items-center">
            <button type="button" className="btn w-" onClick={copyToClipboard}>
              {isCopied ? (
                <span>👍</span>
              ) : (
                <FontAwesomeIcon icon={faLink} />
              )}
              Copy Link
            </button>

            <a className="btn btn-twitter" href={twitterLink} target="_blank" rel="noreferrer">
              <FontAwesomeIcon icon={faTwitter} /> Share
            </a>

            <Button onClick={copyDIMLink} className="dim-btn flex items-center gap-1">
              <img src="/img/dim-logo.svg" className="dim-logo" alt="DIM Logo" /> <span>DIM Link</span>
            </Button>

            <BookmarkButton buildId={buildId} buildData={buildData} />

            {isOwner && !isEditing && (
              <button type="button" className="btn" onClick={() => editBuild()}>
                <FontAwesomeIcon icon={faEdit} /> Edit
              </button>
            )}

            {isOwner && isEditing && (
              <>
                <button type="button" className="btn" onClick={() => updateBuild()}>
                  <FontAwesomeIcon icon={faSave} /> Save
                </button>
                <button type="button" className="btn" onClick={() => cancelEditBuild()}>
                  <FontAwesomeIcon icon={faBan} /> Cancel
                </button>
              </>
            )}

            {isOwner && (
              <button type="button" className="btn" onClick={() => setIsArchiveModalDisplayed(true)}>
                <FontAwesomeIcon icon={faBox} /> Archive
              </button>
            )}

          </div>
          <div className="share-bar-buttons-right">
            <UpvoteButton buildId={buildId} buildData={buildData} isBuildArchived={isBuildArchived} />
          </div>
        </div>



      </div>
      <div className={`mt-1 col-md-${12 / columns}`}>
        {displayNotes && !isEditing && (
          <div>
            <span className="build-info-header">Notes</span>
            {displayNotes && <div dangerouslySetInnerHTML={{__html: displayNotes}} />}
            {areNotesLong && <a href="#" className="read-more-link" onClick={() => setIsNotesDialogDisplayed(true)}>Read more</a>}
            {/* <div className="build-notes" dangerouslySetInnerHTML={{ __html: buildData.notes }} /> */}
          </div>
        )}
        {isEditing && (
          <div>
            <div className="form-group mb-3">
              <label htmlFor="buildName" className="form-label build-info-header">Name</label>
              <input type="text"
                value={buildName}
                onChange={(e) => setBuildName(e.target.value)}
                id="buildName"
                className="form-control"
                placeholder="Give your build a name" />
            </div>
            <div className="form-group mb-3">
            <label htmlFor="buildNotes" className="form-label build-info-header">Notes</label>
              <textarea
                value={buildNotes}
                onChange={(e) => setBuildNotes(e.target.value)}
                id="buildNotes"
                className="form-control"
                placeholder="Add notes about how to best use the build, what synergizes together, etc."
                rows={5}>
              </textarea>
            </div>
          </div>
        )}
        {(primaryActivity || buildData.inputStyle) && (<div className="build-info-header mt-3">Works Best With</div>)}
        <div className="build-info-icons">
          {primaryActivity && <img src={primaryActivity.iconUrl} alt="Primary Activity Icon" />}
          {buildData.inputStyle === '1' && (<img src="/img/input-icons/mnk.png" alt="Mouse and Keyboard" />)}
          {buildData.inputStyle === '2' && (<img src="/img/input-icons/controller.png" alt="Controller" />)}
        </div>
      </div>

      {(createdBy || guardianOf) && (
        <div className={`mt-1 col-md-${12 / columns}`}>
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

      {buildData.videoLink && (
        <div className={`mt-1 col-md-${12 / columns}`}>
          <div className="build-info-header">Video Review</div>
          <YouTubeEmbed youtubeUrl={buildData.videoLink} />
        </div>
      )}

      <ForgeModal show={isArchiveModalDisplayed} title="Archive Build" footer={
        <div>
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

      <ForgeModal show={isNotesDialogDisplayed} title="Build Notes" size="lg" scrollable footer={<ForgeButton onClick={() => setIsNotesDialogDisplayed(false)}>Close</ForgeButton>}>
        <>
          {reformattedNotes && <div dangerouslySetInnerHTML={{__html: reformattedNotes}} />}
        </>
      </ForgeModal>
    </Wrapper>
  )
}

export default BuildMetaPanel
