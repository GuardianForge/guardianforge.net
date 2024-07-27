import { useContext, useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import YouTubeEmbed from './YouTubeEmbed';
import styled from 'styled-components';
import { GlobalContext } from '../contexts/GlobalContext';
import ForgeModal from './Modal'
import { Link } from 'react-router-dom'
import colors from '../colors';
import ForgeButton from './forms/Button';
import { UserInfo } from '../models/User';
import ActivityOption from '../models/ActivityOption';
import { faFacebook, faTwitch, faTwitter, faYoutube } from '@fortawesome/free-brands-svg-icons';
import Card from './ui/Card';

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
  primaryActivity: ActivityOption
  secondaryActivity: ActivityOption
  createdBy?: UserInfo
  guardianOf?: UserInfo
  notes?: string
  className?: string
  videoLink?: string
  inputStyle?: string
}

function BuildMetaPanel({ createdBy, guardianOf, notes, videoLink, className, inputStyle, primaryActivity, secondaryActivity }: Props) {
  const [displayNotes, setDisplayNotes] = useState<string>()
  const [areNotesLong, setAreNotesLong] = useState(false)
  const [isNotesDialogDisplayed, setIsNotesDialogDisplayed] = useState(false)
  const [reformattedNotes, setReformattedNotes] = useState("")

  useEffect(() => {
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
  }, [notes])

  return (
    <Wrapper className={className}>
      {/* Info */}
      <Card className='grid md:grid-cols-3 gap-4'>
        <div>
          {displayNotes && (
            <div>
              <span className="build-info-header">Notes</span>
              {displayNotes && <div className="break-words" dangerouslySetInnerHTML={{__html: displayNotes}} />}
              {areNotesLong && <a href="#" className="read-more-link" onClick={() => setIsNotesDialogDisplayed(true)}>Read more</a>}
            </div>
          )}

          {((primaryActivity && primaryActivity.iconUrl) || inputStyle) && (<div className="build-info-header mt-3">Works Best With</div>)}
          <div className="build-info-icons">
            {primaryActivity && primaryActivity.iconUrl && <img src={primaryActivity.iconUrl} alt="Primary Activity Icon" />}
            {secondaryActivity && secondaryActivity.iconUrl && <img src={secondaryActivity.iconUrl} alt="Secondary Activity Icon" />}
            {inputStyle === '1' && (<img src="/img/input-icons/mnk.png" alt="Mouse and Keyboard" />)}
            {inputStyle === '2' && (<img src="/img/input-icons/controller.png" alt="Controller" />)}
          </div>
        </div>



        {videoLink && (
          <div>
            <div className="build-info-header">Video Review</div>
            <YouTubeEmbed youtubeUrl={videoLink} />
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

      {/* Build notes modal */}
      <ForgeModal show={isNotesDialogDisplayed} title="Build Notes" size="lg" scrollable footer={<ForgeButton onClick={() => setIsNotesDialogDisplayed(false)}>Close</ForgeButton>}>
        <>
          {reformattedNotes && <div dangerouslySetInnerHTML={{__html: reformattedNotes}} />}
        </>
      </ForgeModal>
    </Wrapper>
 )
}

export default BuildMetaPanel