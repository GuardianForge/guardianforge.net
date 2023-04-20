import React, { ReactNode } from 'react'
import styled from 'styled-components'
import colors from '../colors'

interface IHighlightableStyleProps {
  isHighlighted?: boolean
  isHighlightable?: boolean
  highlightClass?: string
}

const Wrapper = styled.div<IHighlightableStyleProps>`
  display: inline-block;

  ${props => {
    if(props.highlightClass) {
      return `
        .${props.highlightClass} {
          border: 2px solid ${props.isHighlighted ? `${colors.theme2.highlightColor} !important` : "rgba(0,0,0,0)"};
          animation: ${props.isHighlightable ? "highlightable 2s infinite" : ""};
        }
      `
    } else {
      return `
        border: 2px solid ${props.isHighlighted ? `${colors.theme2.highlightColor} !important` : "rgba(0,0,0,0)"};
        animation: ${props.isHighlightable ? "highlightable 2s infinite" : ""};
      `
    }
  }}


  &:hover {
    cursor: ${props => props.isHighlightable ? "pointer" : "inherit"}
  }

  @keyframes highlightable {
    0% {
      border-color: ${colors.theme2.highlightColor};
    }
    50% {
      border-color: rgba(255, 255, 0, 0.1);
    }
    100% {
      border-color: ${colors.theme2.highlightColor};
    }
  }
`

type Props = {
  highlightKey: string
  alternateKeys?: Array<string>
  highlights?: Array<string>
  isHighlightable?: boolean
  onClick?: Function
  className?: string
  children: ReactNode
  highlightClass?: string
}

function Highlightable(props: Props) {
  const { highlightKey, highlights, isHighlightable, onClick, className, children, highlightClass, alternateKeys } = props

  function onClickHandler() {
    if(onClick && isHighlightable) {
      onClick(highlightKey)
    }
  }

  function isHighlighted(): boolean {
    if(!highlights) return false
    let isHighlighted = false
    if(highlights.find(el => el === highlightKey)) {
      isHighlighted = true
    }
    if(alternateKeys) {
      alternateKeys.forEach((key: string) => {
        if(highlights.find(hl => hl === key)) {
          isHighlighted = true
        }
      })
    }
    return isHighlighted
  }

  return (
    <Wrapper onClick={onClickHandler}
      className={className}
      isHighlighted={isHighlighted()}
      isHighlightable={isHighlightable}
      highlightClass={highlightClass}>
      {children}
    </Wrapper>
  )
}

export default Highlightable