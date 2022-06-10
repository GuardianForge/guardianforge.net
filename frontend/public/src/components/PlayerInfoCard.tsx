import React from 'react';
import styled from 'styled-components';
import { UserInfo } from '../models/User';
import Card from './ui/Card';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faTwitch, faTwitter, faYoutube } from '@fortawesome/free-brands-svg-icons';

const Wrapper = styled(Card)`
  .card-content {
    display: flex;

    .header {
      font-weight: bold;
    }

    &> div {
      margin-right: 20px;
    }
  }

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
  createdBy?: UserInfo
  guardianOf?: UserInfo
}

function PlayerInfoCard(props: Props) {
  const { createdBy, guardianOf } = props

  return (
    <Wrapper title="Player Info">
      <div className="card-content">
        {createdBy && (
          <div>
            <div className="header">Created By</div>
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
          </div>
        )}
        {guardianOf && (
          <div>
            <div className="header">Guardian Of</div>
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
          </div>
        )}
      </div>
    </Wrapper>
  )
}

export default PlayerInfoCard;
