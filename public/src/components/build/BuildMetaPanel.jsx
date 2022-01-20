import React, { useContext, useEffect, useState } from 'react'
import copy from "copy-to-clipboard";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import UpvoteButton from '../../components/build/UpvoteButton';
import BookmarkButton from '../../components/build/BookmarkButton';
import YouTubeEmbed from '../../components/build/YouTubeEmbed';
import activityOptions from '../../utils/activityOptions'
import styled from 'styled-components';
import { GlobalContext } from '../../contexts/GlobalContext';
import ForgeModal from '../Modal'
import { Link } from 'gatsby'

const Wrapper = styled.div`
  background-color: #1e1f24;
  border-radius: 5px;
  margin: 5px;
  padding-bottom: 10px;

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
    border-bottom: 1px solid #333;
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

function BuildMetaPanel({ buildId, buildData, onBuildUpdated, onBuildUpdateFailed }) {
  const { isConfigLoaded, isUserDataLoaded, dispatchAlert } = useContext(GlobalContext)
  const [twitterLink, setTwitterLink] = useState("")
  const [primaryActivity, setPrimaryActivity] = useState("")
  const [isCopied, setIsCopied] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [buildName, setBuildName] = useState("")
  const [buildNotes, setBuildNotes] = useState("")
  const [isArchiveModalDisplayed, setIsArchiveModalDisplayed] = useState(false)
  const [isBuildArchived, setIsBuildArchived] = useState(false)
  const [createdBy, setCreatedBy] = useState(null)
  const [guardianOf, setGuardianOf] = useState(null)
  const [columns, setColumns] = useState(2)
  const [isPrivate, setIsPrivate] = useState(false)

  useEffect(() => {
    let _cols = 1
    if(buildData.videoLink) {
      _cols++
    }
    if(buildData.createdBy || (buildData.selectedUser && buildData.selectedUser.bungieNetUserId)) {
      _cols++
    }
    setColumns(_cols)
  }, [])

  useEffect(() => {
    if (!isUserDataLoaded) return
    async function init() {
      const { ForgeClient } = window.services
      if(ForgeClient.userBuilds && ForgeClient.userBuilds.find(b => b.id === buildId)) {
        setIsOwner(true)
      }
    }
    init()
  }, [isUserDataLoaded])

  useEffect(() => {
    if(!isConfigLoaded) return
    async function load() {
      const { ForgeApiService, BungieApiService } = window.services
      // TODO: Optimize this, if they are the same ID
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
    }
    load()
  }, [isConfigLoaded])

  useEffect(() => {
    if(buildData.primaryActivity) {
      let activity = activityOptions.find(el => el.value === buildData.primaryActivity)
      if(activity && activity.value !== '1') {
        setPrimaryActivity(activity)
      }
    }

    // setup twitter link
    let tweetText = "Checkout this build I found on @guardianforge!"
    setTwitterLink(`https://twitter.com/intent/tweet?text=${tweetText}&url=${window.location.href}&hashtags=destiny2`)
  }, [])

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
      let token = await ForgeClient.getToken()
      await ForgeApiService.archiveBuild(buildId, token)
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
      let notes = buildNotes.replace(/\n/g, "<br/>")
      let updates = {
        name: buildName,
        notes
      }

      if(onBuildUpdated) {
        onBuildUpdated(updates)
      }
      setIsEditing(false)

      let { ForgeClient, ForgeApiService } = window.services
      let token = await ForgeClient.getToken()
      await ForgeApiService.updateBuild(buildId, updates, token)

      // Update cache
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

  return (
    <Wrapper className="row">
      <div className="share-bar col-md-12">
        <div className="btn-group share-bar-buttons">
          <div className="share-bar-buttons-left">
            <button type="button" className="btn" onClick={copyToClipboard}>
              {isCopied ? (
                <span>👍</span>
              ) : (
                <FontAwesomeIcon icon="link" />
              )}
              Copy Link
            </button>
            <a className="btn btn-twitter" href={twitterLink} target="_blank"><FontAwesomeIcon icon={['fab', 'twitter']} /> Share</a>
            <BookmarkButton buildId={buildId} buildData={buildData} />
            {isOwner && !isEditing && (
              <button type="button" className="btn" onClick={() => editBuild()}>
                <FontAwesomeIcon icon="edit" /> Edit
              </button>
            )}
            {isOwner && isEditing && (
              <>
                <button type="button" className="btn" onClick={() => updateBuild()}>
                  <FontAwesomeIcon icon="save" /> Save
                </button>
                <button type="button" className="btn" onClick={() => cancelEditBuild()}>
                  <FontAwesomeIcon icon="ban" /> Cancel
                </button>
              </>
            )}
            {isOwner && (
              <button type="button" className="btn" onClick={() => setIsArchiveModalDisplayed(true)}>
                <FontAwesomeIcon icon="box" /> Archive
              </button>
            )}
          </div>
          <div className="share-bar-buttons-right">
            <UpvoteButton buildId={buildId} buildData={buildData} isBuildArchived={isBuildArchived} />
          </div>
        </div>
      </div>
      <div className={`mt-1 col-md-${12 / columns}`}>
        {buildData.notes && !isEditing && (
          <div>
            <span className="build-info-header">Notes</span>
            <div className="build-notes" dangerouslySetInnerHTML={{ __html: buildData.notes }} />
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
                rows="5">
              </textarea>
            </div>
          </div>
        )}
        {(primaryActivity || buildData.inputStyle) && (<div className="build-info-header mt-3">Works Best With</div>)}
        <div className="build-info-icons">
          {primaryActivity && <img src={primaryActivity.iconUrl} />}
          {buildData.inputStyle === '1' && (<img src="/img/input-icons/mnk.png" />)}
          {buildData.inputStyle === '2' && (<img src="/img/input-icons/controller.png" />)}
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
                      <a href={createdBy.social.twitter} className="twitter-link" target="_blank">
                        <FontAwesomeIcon icon={['fab', 'twitter']} />
                      </a>
                    )}
                    {createdBy.social.twitch && (
                      <a href={createdBy.social.twitch} className="twitch-link" target="_blank">
                        <FontAwesomeIcon icon={['fab', 'twitch']} />
                      </a>
                    )}
                    {createdBy.social.youtube && (
                      <a href={createdBy.social.youtube} className="youtube-link" target="_blank">
                        <FontAwesomeIcon icon={['fab', 'youtube']} />
                      </a>
                    )}
                    {createdBy.social.facebook && (
                      <a href={createdBy.social.facebook} className="facebook-link" target="_blank">
                        <FontAwesomeIcon icon={['fab', 'facebook']} />
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
                      <a href={guardianOf.social.twitter} className="twitter-link" target="_blank">
                        <FontAwesomeIcon icon={['fab', 'twitter']} />
                      </a>
                    )}
                    {guardianOf.social.twitch && (
                      <a href={guardianOf.social.twitch} className="twitch-link" target="_blank">
                        <FontAwesomeIcon icon={['fab', 'twitch']} />
                      </a>
                    )}
                    {guardianOf.social.youtube && (
                      <a href={guardianOf.social.youtube} className="youtube-link" target="_blank">
                        <FontAwesomeIcon icon={['fab', 'youtube']} />
                      </a>
                    )}
                    {guardianOf.social.facebook && (
                      <a href={guardianOf.social.facebook} className="facebook-link" target="_blank">
                        <FontAwesomeIcon icon={['fab', 'facebook']} />
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

      <ForgeModal show={isArchiveModalDisplayed} title="Archive Build" buttons={[
        {
          title: "Cancel",
          onClick: () => setIsArchiveModalDisplayed(false)
        },
        {
          title: "Archive",
          onClick: () => archiveBuild()
        }
      ]}>
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

      {/* <Modal className="" show>
        <Modal.Header closeButton>
          <Modal.Title>Archive Build</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p>
            Archiving a build will do the following;
          </p>
          <ul>
            <li>Remove from "My Builds"</li>
            <li>Remove from search & other public build lists</li>
            <li>Remove upvote & ownership information</li>
          </ul>
          <p>Direct links & bookmarks will still be valid. <b>This operation CANNOT be undone.</b></p>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="primary">Submit</Button>
        </Modal.Footer>
      </Modal> */}
    </Wrapper>
  )
}

export default BuildMetaPanel
