import React, { ReactNode } from 'react'

type Props = {
  children?: ReactNode
}

function TabGroup({ children }: Props) {
  return (
    <div className="border-b border-b-neutral-600 flex gap-2 mb-2 overflow-x-scroll md:overflow-x-hidden overflow-y-hidden whitespace-nowrap">
      { children }
    </div>
  )
}

export default TabGroup