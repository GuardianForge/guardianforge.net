import React from 'react'
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons'

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
        <FontAwesomeIcon icon={faCircleNotch} className="fa-spin" />
      </Wrapper>
    </div>
  )
}

export default Loading
