import React, { ReactNode } from 'react';

type Props = {
  className?: string
  title?: string
  children: ReactNode
}

function Card(props: Props) {
  const { className, children } = props

  return (
    <div className={`bg-neutral-800 border border-neutral-700 p-2 ${className}`} >
      { children }
    </div>
  )
}

export default Card;
