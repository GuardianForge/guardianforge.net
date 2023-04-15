import React, { ReactElement } from 'react'

type Props = {
  onClick: Function
  children: ReactElement | string
  active: boolean
}

function TabItem({ onClick, children, active }: Props) {
  return (
    <div
      onClick={() => onClick()}
      className={`uppercase px-1 py-2 transition hover:cursor-pointer ${ active ? 'text-bold border-b-2 border-b-neutral-400' : 'border-b-2 border-b-transparent text-neutral-400 hover:text-inherit'} `}>
      { children }
    </div>
  )
}

export default TabItem