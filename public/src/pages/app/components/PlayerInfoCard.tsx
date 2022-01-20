import React from 'react';
import styled from 'styled-components';
import { UserInfo } from '../models/User';
import Card from './ui/Card';
import { Link } from 'gatsby';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

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
          </div>
        )}
      </div>
    </Wrapper>
  )
}

export default PlayerInfoCard;
