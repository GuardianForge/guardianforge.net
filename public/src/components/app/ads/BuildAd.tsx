import React, { useEffect, useContext} from 'react'
import { GlobalContext } from '../../../contexts/GlobalContext'
import { useDetectAdBlock } from "adblock-detect-react"
import styled from 'styled-components';
import { Alert } from 'react-bootstrap';
import SubscribeButton from '../stripe/SubscribeButton';

const AdBlockDetectedWrapper = styled(Alert)`
  margin-top: 10px;
  display: flex;
  justify-content: center;

  .inner-wrapper {
    max-width: 600px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
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
    <AdBlockDetectedWrapper variant="warning">
      <div className="inner-wrapper">
        <div style={{marginBottom: "10px"}}>
          GuardianForge takes a lot of effort and resources to maintain. Please consider disabling your ad blocker, or becoming a subscriber!
        </div>
        <SubscribeButton />
      </div>
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