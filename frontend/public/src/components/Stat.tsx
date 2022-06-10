import React, { useEffect, useState } from 'react'
import { Tooltip, OverlayTrigger } from 'react-bootstrap'
import styled from 'styled-components'
import { imageFixerMap } from "../utils/shims"
import Highlightable from './Highlightable'

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
  value?: number
  name: string
  onClick?: Function
  highlights: Array<string>
  isHighlightable?: boolean
  onHighlightableClicked?: Function
}

function Stat(props: Props) {
  const { iconUrl, value, name, onClick, highlights, isHighlightable, onHighlightableClicked } = props

  const [fixedIcon, setFixedIcon] = useState("")

  useEffect(() => {
    // @ts-ignore TODO: Fix me
    if(imageFixerMap[iconUrl]) {
      // @ts-ignore TODO: Fix me
      setFixedIcon(imageFixerMap[iconUrl])
    }
  }, [])

  return (
    <Wrapper>
      <Highlightable highlightKey={`stat-${name}-0-0`}
        isHighlightable={isHighlightable}
        highlights={highlights}
        highlightClass="stat-icon"
        onClick={onHighlightableClicked}>
        <OverlayTrigger
          placement="bottom"
          delay={{ show: 250, hide: 400 }}
          overlay={<Tooltip>{name.charAt(0).toUpperCase() + name.slice(1)}</Tooltip>}>
              <img src={fixedIcon ? fixedIcon : iconUrl} className="stat-icon" />
        </OverlayTrigger>
      </Highlightable>
      <span>{value}</span>
    </Wrapper>
  )
}

export default Stat
