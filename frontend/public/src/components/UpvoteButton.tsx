import React, { useContext, useEffect, useState } from 'react'
import { GlobalContext } from '../contexts/GlobalContext'
import UpvoteIcon from './UpvoteIcon'
import buildUtils from '../utils/buildUtils'
import { Tooltip, OverlayTrigger } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Build from '../models/Build'

type Props = {
  buildId: string
  buildData: Build
  isBuildArchived: boolean
  className?: string
}

function UpvoteButton({ buildId, buildData, isBuildArchived, className }: Props) {
  const { isInitDone, redirectToLogin, isLoggedIn } = useContext(GlobalContext)
  const [isUpvoted, setIsUpvoted] = useState(false)
  const [upvoteCount, setUpvoteCount] = useState(0)
  const [isUpvoting, setIsUpvoting] = useState(false)
  const [isArchived, setIsArchived] = useState(false)

  useEffect(() => {
    if(!isInitDone) return
    async function init() {
      const { ForgeApiService, ForgeClient } = window.services
      let upvoteCount = await ForgeApiService.getUpvoteCount(buildId)
      let numCount = Number(upvoteCount)
      if(numCount < 0) {
        setIsArchived(true)
      } else {
        setUpvoteCount(Number(upvoteCount))
      }

      if(ForgeClient.userUpvotes && ForgeClient.userUpvotes[buildId]) {
        setIsUpvoted(true)
      }

      if(isBuildArchived) {
        setIsArchived(true)
      }
    }
    init()
  }, [isInitDone])

  useEffect(() => {
    if(isBuildArchived) {
      setIsArchived(true)
    } else {
      setIsArchived(false)
    }
  }, [isBuildArchived])

  async function upvoteBuild() {
    const { ForgeClient, ForgeApiService } = window.services
    if(!isUpvoting) {
      setIsUpvoting(true)
      let prevState = {
        isUpvoted,
        upvoteCount
      }

      try {
        if(!isUpvoted) {
          setUpvoteCount(upvoteCount + 1)
          setIsUpvoted(true)
        } else {
          setUpvoteCount(upvoteCount - 1)
          setIsUpvoted(false)
        }
        let buildSummary = buildUtils.convertToSummary(buildId, buildData)
        let token = ForgeClient.getToken()
        let res = await ForgeApiService.upvoteBuild(token, buildSummary)
        ForgeClient.userUpvotes = res
      } catch (err) {
        console.error(err)
        setIsUpvoted(prevState.isUpvoted)
        setUpvoteCount(prevState.upvoteCount)
      }
      setIsUpvoting(false)
    }
  }

  function onClick() {
    if(isLoggedIn) {
      upvoteBuild()
    } else {
      redirectToLogin()
    }
  }

  if(isArchived) {
    return (
      <OverlayTrigger
        placement="bottom"
        delay={{ show: 250, hide: 400 }}
        overlay={<Tooltip>This build is private or has been archived. Upvoting has been disabled.</Tooltip>}>
        <div className={`hover:cursor-not-allowed ${className}`}>
          <button disabled>
            <FontAwesomeIcon icon="ban" />
          </button>
        </div>
      </OverlayTrigger>
    )
  } else {
    return (
      <button className={`${isUpvoted ? 'text-orange-600' : ''} ${className}`} onClick={onClick}>
        <UpvoteIcon className='mr-1' filled={isUpvoted} />
        { isUpvoted }
        { upvoteCount }
      </button>
    )
  }
}

export default UpvoteButton
