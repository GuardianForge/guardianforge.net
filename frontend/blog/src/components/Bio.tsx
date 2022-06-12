import React from "react"
import styled from 'styled-components'

const Wrapper = styled.div`
  display: flex;
  margin-bottom: 10px;

  .bio-info {
    flex: 1;
    margin: 5px 10px;
  }

  .bio-avatar {
    border-radius: 100px;
    width: 75px;
    height: 75px;
  }
`

type Props = {
  author: any
}

const Bio = (props: Props) => {
  const { author } = props

  const avatarUrl = author?.avatar?.url

  return (
    <Wrapper>
      {avatarUrl && (
        <img
          alt={author?.firstName || ``}
          className="bio-avatar"
          src={avatarUrl}
        />
      )}
      {author?.firstName && (
        <div className="bio-info">
          Written by <strong>{author.firstName}</strong>
          {` `}
          {author?.description || null}
          {` `}
          {author?.twitter && (
            <a href={`https://twitter.com/${author.twitter || ``}`}>
              @{author.twitter}
            </a>
          )}
        </div>
      )}
    </Wrapper>
  )
}

export default Bio
