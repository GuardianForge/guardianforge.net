import React, { useEffect, useState } from 'react'
import FeatureToggle from '../../../models/FeatureToggle'

type Props = {
  toggle: FeatureToggle
  children: any
}

function FeatureToggleWrapper(props: Props) {
  let { toggle, children } = props
  const [_isEnabled, setIsEnabled] = useState(false)

  useEffect(() => {
    if(toggle.isEnabled()) {
      setIsEnabled(true)
    }
  }, [])

  return (
    <>
      {_isEnabled && (
        <div>
          {children}
        </div>
      )}
    </>
  )
}

export default FeatureToggleWrapper

