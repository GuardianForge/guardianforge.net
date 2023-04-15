import React, { ReactElement } from 'react'

type Props = {
  children?: ReactElement | ReactElement[]
}

function TabGroup({ children }: Props) {
  return (
    <div className="border-b border-b-neutral-600 flex gap-2 mb-2">
      { children }
    </div>
  )
}

export default TabGroup