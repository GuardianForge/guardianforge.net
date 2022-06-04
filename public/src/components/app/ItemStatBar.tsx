import React from 'react'
import styled from 'styled-components'
import colors from '../../colors'

type Props = {
  value: number
}

const Wrapper = styled.div<Props>`
  background-color: ${colors.theme2.dark3};
  width: 100%;
  border-radius: 5px;
  height: 24px;

  .filled {
    background-color ${colors.theme2.text};
    width: ${props => props.value}%;
    border-radius: ${props => props.value === 100 ? "5px" : "5px 0px 0px 5px"};
  }
`

function ItemStatBar(props: Props) {
  return (
    <Wrapper value={props.value}>
      <div className="filled">
        &nbsp;
      </div>
    </Wrapper>
  )
}

export default ItemStatBar