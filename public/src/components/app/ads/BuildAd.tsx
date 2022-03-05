import React, { useEffect, useContext} from 'react'
import { GlobalContext } from '../../../contexts/GlobalContext'
import { useDetectAdBlock } from "adblock-detect-react"
import styled from 'styled-components';
import ForgeButton from '../forms/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGem } from '@fortawesome/free-solid-svg-icons';

const AdBlockDetectedWrapper = styled.div`

`

function BuildAd() {
  const adBlockDetected = useDetectAdBlock();
  const { areAdsDisabled } = useContext(GlobalContext)

  useEffect(() => {
    try {
      const adsbygoogle = window.adsbygoogle || []
      adsbygoogle.push({})
    } catch (err) {
      console.error(err)
    }
  }, [])

  if(areAdsDisabled) return (<></>)

  if(adBlockDetected) return (
    <AdBlockDetectedWrapper>
      GuardianForge takes a lot of effort and resources to maintain! Please consider disbaling your ad blocker, or becoming a subscriber!
      <ForgeButton><FontAwesomeIcon icon={faGem} /> Subscribe</ForgeButton>
    </AdBlockDetectedWrapper>
  )

  return (
    <ins className="adsbygoogle"
      style={{ display: 'block' }}
      data-ad-client="ca-pub-7070984643674033"
      data-ad-slot="6712951385"
      data-ad-format="auto"
      data-full-width-responsive="true"></ins>
  )
}

export default BuildAd