import React from 'react'
import styled from 'styled-components'

type WrapperProps = {
  filled?: boolean
}

const Wrapper = styled.svg<WrapperProps>`
  fill-rule: evenodd;
  clip-rule: evenodd;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-miterlimit: 1.5;
  stroke-width: 7px;
  stroke: currentcolor;
  fill: ${(props: any) => props.filled ? 'currentcolor' : 'none'};
  display: inline-block;
  font-size: inherit;
  width: 0.75em;
  height: 1em;
  vertical-align: -0.125em;
`
type Props = {
  filled?: boolean
  className?: string
}

function UpvoteIcon({ filled, className }: Props) {
  return (
    <Wrapper
      filled={filled}
      className={className}
      version="1.1"
      viewBox="0 0 54 72">
      <path d="M17.095,31.345l-14.714,0c-0.32,0 -0.61,-0.186 -0.742,-0.476c-0.133,-0.291 -0.084,-0.632 0.125,-0.873c4.626,-5.343 21.568,-24.91 24.889,-28.746c0.143,-0.164 0.35,-0.259 0.567,-0.259c0.218,0 0.425,0.095 0.567,0.259c3.344,3.862 20.498,23.674 24.984,28.855c0.192,0.221 0.237,0.535 0.115,0.802c-0.122,0.267 -0.388,0.438 -0.682,0.438c-4.173,0 -14.859,0 -14.859,0l0,39.75c0,0.415 -0.335,0.75 -0.75,0.75c-3.184,0 -15.565,0 -18.75,0c-0.414,0 -0.75,-0.335 -0.75,-0.75c0,-5.528 0,-39.75 0,-39.75Z"/>
    </Wrapper>
  )
}

export default UpvoteIcon
