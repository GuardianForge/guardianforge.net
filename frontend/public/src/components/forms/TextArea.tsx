import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

type Props = {
  value: string
  onChange: Function
  prefixIcon?: IconProp
  placeholder?: string
  right?: React.ReactFragment
  gutter?: React.ReactFragment
  type?: string
  className?: string
  rows?: number
}

function TextArea(props: Props) {
  const { className, value, onChange, prefixIcon, placeholder, right, gutter, rows } = props

  function onChangeHandler(e: any) {
    if(onChange) {
      onChange(e)
    }
  }

  return (
    <div className={`bg-neutral-700 p-2 shadow rounded-sm ${className}`}>
      <div className="flex justify-between bg-transparent items-center">
        <div className="flex items-start gap-1 flex-1">
          {prefixIcon && <FontAwesomeIcon className='text-neutral-500 mt-1' icon={prefixIcon} />}
          <textarea placeholder={placeholder ? placeholder : ""}
            className='bg-transparent flex-1 focus:outline-none focus:border-transparent focus:ring-0 focus-visible:outline-none focus-visible:border-transparent focus-visible:ring-0'
            rows={rows ? rows : 3}
            value={value}
            onChange={onChangeHandler} />
        </div>

        {right && (
          <div className="right">
            { right }
          </div>
        )}

        </div>
        {gutter && (
          <div className="gutter">
            { gutter }
          </div>
        )}
    </div>
  )
}

export default TextArea
