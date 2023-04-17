import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { DebounceInput } from 'react-debounce-input';

type Props = {
  value: string
  onChange: Function
  prefixIcon?: IconProp
  placeholder?: string
  right?: React.ReactFragment
  gutter?: React.ReactFragment
  type?: string
  className?: string
  debounceTimeout?: number
}

function Input(props: Props) {
  const { className, value, onChange, prefixIcon, placeholder, right, gutter, type, debounceTimeout } = props

  function onChangeHandler(e: any) {
    if(onChange) {
      onChange(e)
    }
  }

  return (
    <div className={`bg-neutral-700 p-2 shadow rounded-sm ${className}`}>
      <div className="flex justify-between bg-transparent items-center">
        <div className="flex items-center gap-1 flex-1">
          {prefixIcon && <FontAwesomeIcon className='text-neutral-500' icon={prefixIcon} />}
          {debounceTimeout ? (
            <DebounceInput
              placeholder="Start typing to search..."
              className='bg-transparent flex-1'
              debounceTimeout={debounceTimeout}
              value={value}
              onChange={onChangeHandler} />
          ) : (
            <input placeholder={placeholder ? placeholder : ""}
              className='bg-transparent flex-1'
              value={value}
              onChange={onChangeHandler}
              type={type} />
          )}
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

export default Input
