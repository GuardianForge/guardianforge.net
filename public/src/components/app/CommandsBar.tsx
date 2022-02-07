import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import styled from 'styled-components';
import colors from '../../colors';
import Build from '../../models/Build';
import UpvoteButton from './UpvoteButton'
import copy from "copy-to-clipboard";
import { faBan, faBox, faEdit, faSave } from '@fortawesome/free-solid-svg-icons';
import ForgeButton from './forms/Button';
import ForgeModal from './Modal';

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
      background-color: ${colors.theme2.dark3};
    }

    &:focus {
      background-color: ${colors.theme2.dark3};
      border: none !important;
      box-shadow: none !important;
    }

    &:active {
      background-color: ${colors.theme2.dark3};
      border: none !important;
      box-shadow: none !important;
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
  onEditBuild?: Function
  onSaveBuild?: Function
  onCancelEdit?: Function
  onBuildArchived?: Function
}

function CommandsBar(props: Props) {
  const { buildId, buildData, isOwner, onEditBuild, onSaveBuild, onCancelEdit, onBuildArchived } = props
  const [isBuildArchived, setIsBuildArchived] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [shareLink, setShareLink] = useState("")
  const [twitterLink, setTwitterLink] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [isArchiveBuildModalOpen, setIsArchiveBuildModalOpen] = useState(false)

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

  function saveBuild() {
    // TODO: Implement
    setIsEditing(false)
  }

  function cancelEdit() {
    // TODO: Cancel edits
    setIsEditing(false)
  }

  function archiveBuild() {
    setIsArchiveBuildModalOpen(false)
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
      {isOwner && (
        <>
          <Seperator />
          {!isEditing && (
            <Button onClick={() => setIsArchiveBuildModalOpen(true)}>
              <FontAwesomeIcon icon={faBox} /> Archive
            </Button>
          )}
          {!isEditing && (
            <Button onClick={() => editBuild()}>
              <FontAwesomeIcon icon={faEdit} /> Edit
            </Button>
          )}
          {isEditing && (
            <Button onClick={() => saveBuild()}>
              <FontAwesomeIcon icon={faSave} /> Save
            </Button>
          )}
          {isEditing && (
            <Button onClick={() => cancelEdit()}>
              <FontAwesomeIcon icon={faBan} /> Cancel
            </Button>
          )}
        </>
      )}


    <ForgeModal
      show={isArchiveBuildModalOpen}
      title="Archive Build"
      footer={
        <div>
          <ForgeButton onClick={() => setIsArchiveBuildModalOpen(false)}>Cancel</ForgeButton>
          <ForgeButton style={{marginLeft: "10px"}} onClick={() => archiveBuild()}>Archive</ForgeButton>
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
    </Wrapper>
  )
}

export default CommandsBar;
