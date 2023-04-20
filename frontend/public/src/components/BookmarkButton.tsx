import React, { useContext, useState, useEffect } from 'react'
import { GlobalContext } from "../contexts/GlobalContext"
import buildUtils from '../utils/buildUtils'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Tooltip, OverlayTrigger } from 'react-bootstrap'
import Build from '../models/Build'
import { faBookmark as fasBookmark } from "@fortawesome/free-solid-svg-icons"
import { faBookmark as farBookmark} from "@fortawesome/free-regular-svg-icons"
import ForgeButton from './forms/Button'

type Props = {
  buildId: string
  buildData: Build
}

function BookmarkButton(props: Props) {
  const { buildId, buildData } = props
  const { isInitDone, isLoggedIn, redirectToLogin } = useContext(GlobalContext)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isBookmarking, setIsBookmarking] = useState(false)

  useEffect(() => {
    if(!isInitDone) return
    if(!isLoggedIn) return
    async function init() {
      const { ForgeClient } = window.services
      if(ForgeClient.userBookmarks && ForgeClient.userBookmarks[buildId]) {
        setIsBookmarked(true)
      }
    }
    init()
  }, [isInitDone, buildId, isLoggedIn])

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

  function onClick() {
    if(isLoggedIn) {
      bookmarkBuild()
    } else {
      redirectToLogin()
    }
  }

  return (
    <ForgeButton onClick={onClick} className='min-w-[107px]'>
      <FontAwesomeIcon className={isBookmarked ? 'text-red-600' : ''} icon={isBookmarked ? fasBookmark : farBookmark}/>
      <span>
        {isBookmarked ? "Remove" : "Bookmark"}
      </span>
    </ForgeButton>
  )
}

export default BookmarkButton
