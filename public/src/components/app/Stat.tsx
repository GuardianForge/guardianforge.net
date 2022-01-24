import React, { useEffect, useState } from 'react'
import { Tooltip, OverlayTrigger } from 'react-bootstrap'
import styled from 'styled-components'
// @ts-ignore
import { imageFixerMap } from "../../utils/shims"

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding-right: 15px;

  img {
    max-width: 45px;
    /* padding: 0px 5px; */
    border-radius: 5px;
    margin-right: 5px;
  }

  span {
    font-size: 1.3rem;
  }

  @media (max-width: 576px) {
    margin: 0 auto;
    max-width: 287px;

    img {
      margin: 3px;
    }
  }
`

type Props = {
  iconUrl?: string
  value?: string
  name: string
  onClick?: Function
  highlights: Array<string>
}

function Stat(props: Props) {
  const { iconUrl, value, name, onClick, highlights } = props

  const [isHighlighted, setIsHighlighted] = useState(false)
  const [fixedIcon, setFixedIcon] = useState("")

  useEffect(() => {
    if(imageFixerMap[iconUrl]) {
      setFixedIcon(imageFixerMap[iconUrl])
    }
  }, [])

  useEffect(() => {
    if(highlights.find(el => el === `stat-${name}-0-0`)) {
      setIsHighlighted(true)
    } else {
      setIsHighlighted(false)
    }
  }, [highlights])

  function onClickHandler() {
    if(onClick) {
      onClick(name)
    }
  }

  return (
    <Wrapper>
      <OverlayTrigger
        placement="bottom"
        delay={{ show: 250, hide: 400 }}
        overlay={<Tooltip>{name.charAt(0).toUpperCase() + name.slice(1)}</Tooltip>}>
        <img src={fixedIcon ? fixedIcon : iconUrl}
          className={"highlightable " + (isHighlighted ? "highlighted" : "")}
          onClick={onClickHandler}
          id={`stat-${name}`}
        />
      </OverlayTrigger>
      <span>{value}</span>
    </Wrapper>
  )
}

export default Stat
