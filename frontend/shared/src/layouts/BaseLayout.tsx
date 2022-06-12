import React, { ReactNode } from 'react'
import styled, { createGlobalStyle } from 'styled-components'
import colors from '../colors'

const GlobalStyle = createGlobalStyle`
  body {
    background-color: #14151a !important;
    color: ${colors.theme2.text} !important;
  }
`

const Wrapper = styled.div`
  #app {
    flex-direction: column;
    align-items: center;
    height: 100vh; }

  .build-mode .highlightable {
    border: 2px solid yellow;
    animation: border-pulsate 2s infinite;
    cursor: pointer; }

  .build-mode img.highlighted, #build img.highlighted, .build-mode .light-tree-perk-wrapper.highlighted, #build .light-tree-perk-wrapper.highlighted {
    border: 3px solid yellow;
    animation: none !important; }

  @keyframes border-pulsate {
    0% {
      border-color: yellow; }
    50% {
      border-color: rgba(255, 255, 0, 0.1); }
    100% {
      border-color: yellow; } }

  .btn-secondary {
    background-color: #444 !important;
    border-color: #333 !important; }

  .beta-modal {
    color: #111; }
`

export interface Props {
  children: ReactNode
  className?: string
}

const BaseLayout: React.FunctionComponent<Props> = props => {
  const { children, className } = props

  return (
    <Wrapper className={className}>
      <GlobalStyle />
      { children }
    </Wrapper>
  )
}

export default BaseLayout