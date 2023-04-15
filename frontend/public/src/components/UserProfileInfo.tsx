import { faTwitter, faTwitch, faYoutube, faFacebook } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'

type Props = {
  displayName?: string
  about?: string
  facebookUrl?: string
  twitterUrl?: string
  youtubeUrl?: string
  twitchUrl?: string
}

function UserProfileInfo({ displayName, about, facebookUrl, twitterUrl, youtubeUrl, twitchUrl }: Props) {
  return (
    <div id="user_info" className="flex">
      <div id="user_info_header" className="flex flex-col mb-2 flex-1">
        {displayName && <span className="text-2xl font-bold">
          {displayName}
        </span>}

        {about && <span className="italic">"{ about }"</span>}
      </div>

      <div id="social_info" className="flex gap-1 text-xl">
        {twitterUrl && (
          <a href={twitterUrl}
            className="hover:text-[#1da1f2]"
            target="_blank"
            rel="noreferrer">
            <FontAwesomeIcon icon={faTwitter} />
          </a>
        )}
        {twitchUrl && (
          <a href={twitchUrl}
            className="hover:text-[#9146ff]"
            target="_blank"
            rel="noreferrer">
            <FontAwesomeIcon icon={faTwitch} />
          </a>
        )}
        {youtubeUrl && (
          <a href={youtubeUrl}
            className="hover:text-[#ff0000]"
            target="_blank"
            rel="noreferrer">
            <FontAwesomeIcon icon={faYoutube} />
          </a>
        )}
        {facebookUrl && (
          <a href={facebookUrl}
            className="hover:text-[#1877f2]"
            target="_blank"
            rel="noreferrer">
            <FontAwesomeIcon icon={faFacebook} />
          </a>
        )}
      </div>
    </div>
  )
}

export default UserProfileInfo