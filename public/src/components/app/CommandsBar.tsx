import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import styled from 'styled-components';
import colors from '../../colors';
import Build from '../../models/Build';
import UpvoteButton from './UpvoteButton'
import copy from "copy-to-clipboard";

const Wrapper = styled.div`
  display: flex;
  background-color: ${colors.theme2.dark2};
  border-radius: 5px;
  padding: 5px;
  color: ${colors.theme2.text};
  margin: 5px 0px 10px 0px;

  button, a {
    color: #eee;
    background-color: rgba(0,0,0,0);
    border: none;

    &:hover {
      background-color: ${colors.theme2.dark3}
    }
  }
`

const Seperator = styled.div`
  border-left: 2px solid ${colors.theme2.dark1}
`

type Props = {
  buildId: string
  buildData: Build
  isOwner?: boolean
}

function CommandsBar(props: Props) {
  const { buildId, buildData, isOwner } = props
  const [isBuildArchived, setIsBuildArchived] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [shareLink, setShareLink] = useState("")
  const [twitterLink, setTwitterLink] = useState("")
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    setShareLink(`${location.origin}/build/${buildId}`)

    // TODO: Update this with the same thing I use for Notion
    let tweetText = "Checkout this build I found on @guardianforge!"
    setTwitterLink(`https://twitter.com/intent/tweet?text=${tweetText}&url=${shareLink}&hashtags=destiny2`)
  }, [])

  function copyToClipboard() {
    copy(shareLink)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 3000)
  }

  function editBuild() {
    //   let notes = ""
    //   if(buildData.notes) {
    //     notes = buildData.notes.replace(/<br\/>/g, "\n")
    //   }
    //   setBuildName(buildData.name)
    //   setBuildNotes(notes)
    setIsEditing(true)
  }

  return (
    <Wrapper>
      <UpvoteButton buildId={buildId} buildData={buildData} isBuildArchived={isBuildArchived} />

      <Button onClick={copyToClipboard}>
        {isCopied ? (
          <span>👍</span>
        ) : (
          <FontAwesomeIcon icon="link" />
        )}
        Copy Link
      </Button>
      <Button as="a" className="btn-twitter" href={twitterLink} target="_blank">
        <FontAwesomeIcon icon={['fab', 'twitter']} /> Share
      </Button>
      <Seperator />
      {isOwner && !isEditing && (
        <Button onClick={() => editBuild()}>
          <FontAwesomeIcon icon="edit" /> Edit
        </Button>
      )}
    </Wrapper>
  )
}

export default CommandsBar;
