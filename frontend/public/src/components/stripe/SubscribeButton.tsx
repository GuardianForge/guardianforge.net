import React, { useContext, useState } from 'react'
import ForgeButton from '../forms/Button'
import styled from 'styled-components';
import { GlobalContext } from '../../contexts/GlobalContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGem } from '@fortawesome/free-solid-svg-icons';
import SubscribeModal from './SubscribeModal';

const Wrapper = styled.div`
  .selected {
    background-color: cyan !important;
  }
`

function SubscribeButton() {
  const { redirectToLogin, isLoggedIn } = useContext(GlobalContext)
  const [isModalShowing, setIsModalShowing] = useState(false)

  function onSubscribeClicked() {
    const { ForgeClient } = window.services
    if(!ForgeClient) return
    if(!isLoggedIn) {
      redirectToLogin("/app?showSubscribeModal=true")
      return
    }
    setIsModalShowing(true)
  }

  return (
    <Wrapper>
      <ForgeButton onClick={onSubscribeClicked}>
        <FontAwesomeIcon icon={faGem} /> Subscribe
      </ForgeButton>

      <SubscribeModal show={isModalShowing} onHide={() => setIsModalShowing(false)} />
    </Wrapper>
  )
}

export default SubscribeButton