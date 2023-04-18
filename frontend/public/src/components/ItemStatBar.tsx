import React from 'react'
import styled from 'styled-components'
import colors from '../colors'

type Props = {
  value: number
}

const Wrapper = styled.div<Props>`
  width: 100%;
  height: 24px;

  .filled {
    background-color ${colors.theme2.text};
    width: ${props => props.value}%;
  }
`

function ItemStatBar(props: Props) {
  return (
    <Wrapper value={props.value} className='bg-neutral-700 border border-neutral-600'>
      <div className="filled">
        &nbsp;
      </div>
    </Wrapper>
  )
}

export default ItemStatBar