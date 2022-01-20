import React from 'react'
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const Wrapper = styled.div`
  font-size: 2.5rem;
  width: 100%;
  display: flex;
  justify-content: center;
  /* max-height: 40px; */
  height: 40px;
`

function Loading() {
  return (
    <div>
      <Wrapper>
        <FontAwesomeIcon icon="circle-notch" className="fa-spin" />
      </Wrapper>
    </div>
  )
}

export default Loading
