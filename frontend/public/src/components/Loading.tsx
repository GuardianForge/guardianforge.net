import React from 'react'
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons'

const Wrapper = styled.div`
  font-size: 2.5rem;
  width: 100%;
  display: flex;
  justify-content: center;
`

type Props = {
  small?: boolean
  className?: string
}

function Loading({ small, className }: Props) {
  return (
    <div>
      <Wrapper className={small ? '' : 'h-[40px]'}>
        <FontAwesomeIcon icon={faCircleNotch} className={`fa-spin ${small ? 'h-[20px]' : ''}`} />
      </Wrapper>
    </div>
  )
}

export default Loading
