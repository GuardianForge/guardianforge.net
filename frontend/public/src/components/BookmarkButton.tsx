import React, { useContext, useState, useEffect } from 'react'
import styled from 'styled-components'
import { GlobalContext } from "../contexts/GlobalContext"
import buildUtils from '../utils/buildUtils'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Tooltip, OverlayTrigger } from 'react-bootstrap'
import Build from '../models/Build'
import { faBookmark as fasBookmark } from "@fortawesome/free-solid-svg-icons"
import { faBookmark as farBookmark} from "@fortawesome/free-regular-svg-icons"
import ForgeButton from './forms/Button'

interface ButtonProps {
  isBookmarked?: boolean
}

const Button = styled.button<ButtonProps>`
  border: none !important;

  &:disabled {
    border: none !important;
  }

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
  }, [isInitDone, buildId])

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
        let token = ForgeClient.getToken()
        let res = await ForgeApiService.bookmarkBuild(token, buildSummary)
        ForgeClient.userBookmarks = res
      } catch (err) {
        console.error(err)
        setIsBookmarked(prevState)
      }
      setIsBookmarking(false)
    }
  }

  if(isLoggedIn) {
    return (
      <ForgeButton onClick={bookmarkBuild} className='min-w-[107px]'>
        <FontAwesomeIcon className={isBookmarked ? 'text-red-600' : ''} icon={isBookmarked ? fasBookmark : farBookmark}/>
        <span>
          {isBookmarked ? "Remove" : "Bookmark"}
        </span>
      </ForgeButton>
    )
  } else {
    return (
      <OverlayTrigger
        placement="bottom"
        delay={{ show: 250, hide: 400 }}
        overlay={<Tooltip>Login to bookmark this build.</Tooltip>}>
        <ForgeButton type="button" className="flex items-center gap-1" disabled>
          <FontAwesomeIcon icon={farBookmark} />
          <span className="d-none d-md-inline">Add to Bookmarks</span>
        </ForgeButton>
      </OverlayTrigger>
    )
  }
}

export default BookmarkButton
