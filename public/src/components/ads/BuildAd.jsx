import React, { useEffect, useContext } from 'react'
import { GlobalContext } from '../../contexts/GlobalContext'

function BuildAd() {
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