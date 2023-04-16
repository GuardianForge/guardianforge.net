import React from 'react'
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import colors from "../../colors"

const Wrapper = styled.div`
  color: #eee;
  background-color: ${colors.theme2.dark3};
  border-radius: 5px;
  box-shadow: 5px 5px rgba(0,0,0,0.1);
  padding: 10px;

  .main {
    display: flex;
    justify-content: space-between;

    textarea {
      color: #eee;
      background-color: inherit !important;
      border: 0;
      width: 100%;
      height: auto;

      &:focus {
        outline: none;
      }
    }

    .left {
      display: flex;
      align-items: top0;
      flex: 1;

      svg {
        color: ${colors.theme2.dark1};
        margin: 5px 3px;
      }

      input {
        flex: 1
      }
    }

    .right {
      display: flex;

      .submit-button {
        color: #eee;
        background-color: #006eff !important;
        border: 0;
        border-radius: 5px;
        width: 50px;
      }
    }
  }

  .gutter {
    display: flex;
    flex-flow: row wrap;
  }
`

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
            className='bg-transparent flex-1'
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
