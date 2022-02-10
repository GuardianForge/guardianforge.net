import React, { useContext, useState, useEffect } from 'react'
import styled from 'styled-components'
// @ts-ignore
import { GlobalContext } from "../../contexts/GlobalContext"
// @ts-ignore
import buildUtils from '../../utils/buildUtils'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Tooltip, OverlayTrigger } from 'react-bootstrap'
import Build from '../../models/Build'

interface ButtonProps {
  isBookmarked?: boolean
}

const Button = styled.button<ButtonProps>`
  &:hover {
    color: inherit !important;
  }

  svg {
    color: ${props => props.isBookmarked ? "red" : "inherit"};
  }
`

type Props = {
  buildId: string
  buildData: Build
}

function BookmarkButton(props: Props) {
  const { buildId, buildData } = props
  const { isInitDone } = useContext(GlobalContext)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isBookmarking, setIsBookmarking] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    if(!isInitDone) return
    async function init() {
      const { ForgeClient } = window.services
      if(ForgeClient.isLoggedIn()) {
        setIsLoggedIn(true)
      }
      if(ForgeClient.userBookmarks && ForgeClient.userBookmarks[buildId]) {
        setIsBookmarked(true)
      }
    }
    init()
  }, [isInitDone])

  async function bookmarkBuild() {
    const { ForgeClient, ForgeApiService } = window.services
    if(!isBookmarking) {
      setIsBookmarking(true)
      let prevState = isBookmarked

      try {
        if(!isBookmarked) {
          setIsBookmarked(true)
        } else {
          setIsBookmarked(false)
        }

        let buildSummary = buildUtils.convertToSummary(buildId, buildData)
        let token = await ForgeClient.getToken()
        let res = await ForgeApiService.bookmarkBuild(token, buildSummary)
        ForgeClient.userBookmarks = res
      } catch (err) {
        console.error(err)
        setIsBookmarked(prevState)
      }
      setIsBookmarking(false)
    }
  }

  return (
    <div>
      {isLoggedIn ? (
        <Button type="button" className="btn" onClick={bookmarkBuild} isBookmarked={isBookmarked}>
          <FontAwesomeIcon icon={isBookmarked ? ['fas', 'bookmark'] : ['far', 'bookmark']}/>
          <span className="d-none d-sm-inline">{isBookmarked ? "Remove from Bookmarks" : "Add to Bookmarks"}</span>
        </Button>
      ) : (
          <OverlayTrigger
            placement="bottom"
            delay={{ show: 250, hide: 400 }}
            overlay={<Tooltip>Login to bookmark this build.</Tooltip>}>
            <div style={{cursor: "not-allowed"}}>
              <button type="button"
                className="btn"
                disabled>
                <FontAwesomeIcon icon={['far', 'bookmark']} />
                <span className="d-none d-sm-inline">Add to Bookmarks</span>
              </button>
            </div>
          </OverlayTrigger>
      )}
    </div>
  )
}

export default BookmarkButton
