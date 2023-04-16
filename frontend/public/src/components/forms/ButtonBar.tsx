import React, { ReactNode } from 'react';

type Props = {
  children: ReactNode
  className?: string
}

function ButtonBar({ children, className }: Props) {
  return (
    <div className={`flex gap-2 mb-2 ${className}`}>
      { children }
    </div>
  )
}

export default ButtonBar;
