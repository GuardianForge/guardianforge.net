import React, { useContext, useEffect, useState } from 'react'
import { GlobalContext } from '../contexts/GlobalContext'
import UpvoteIcon from './UpvoteIcon'
import buildUtils from '../utils/buildUtils'
import { Tooltip, OverlayTrigger } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Build from '../models/Build'
import styled from 'styled-components'
import colors from '../colors'

const Wrapper = styled.div`
  button {
    color: ${colors.theme2.text} !important;
  }
  svg {
    margin-right: 5px;
  }
`

type Props = {
  buildId: string
  buildData: Build
  isBuildArchived: boolean
}

function UpvoteButton(props: Props) {
  const { buildId, buildData, isBuildArchived } = props
  const { isInitDone } = useContext(GlobalContext)
  const [isUpvoted, setIsUpvoted] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
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

      if(ForgeClient.isLoggedIn()) {
        setIsLoggedIn(true)
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

  return (
    <Wrapper>
      {isArchived ? (
        <OverlayTrigger
          placement="bottom"
          delay={{ show: 250, hide: 400 }}
          overlay={<Tooltip>This build is private or has been archived. Upvoting has been disabled.</Tooltip>}>
          <div style={{cursor: "not-allowed"}}>
            <button type="button"
              className="btn"
              disabled>
              <FontAwesomeIcon icon="ban" />
            </button>
          </div>
        </OverlayTrigger>
      ) : (
        <>
          {isArchived === false && isLoggedIn ? (
            <button type="button" style={{ color: isUpvoted ? "orange" : "" }} className="btn" onClick={upvoteBuild}>
              <UpvoteIcon filled={isUpvoted} />
              { upvoteCount }
            </button>
          ) : (
            <OverlayTrigger
              placement="bottom"
              delay={{ show: 250, hide: 400 }}
              overlay={<Tooltip>Login to upvote this build.</Tooltip>}>
              <div style={{cursor: "not-allowed"}}>
                <button type="button"
                  className="btn border-none"
                  disabled>
                  <UpvoteIcon filled />
                  { upvoteCount }
                </button>
              </div>
            </OverlayTrigger>
          )}
        </>
      )}
    </Wrapper>
  )
}

export default UpvoteButton
