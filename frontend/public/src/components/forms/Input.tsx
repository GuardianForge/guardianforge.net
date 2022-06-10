import React, { useState } from 'react'
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

    input {
      color: #eee;
      background-color: inherit !important;
      border: 0;

      &:focus {
        outline: none;
      }
    }

    .left {
      display: flex;
      align-items: center;
      flex: 1;

      svg {
        color: ${colors.theme2.dark1};
        margin: 0px 3px;
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
}

function Input(props: Props) {
  const { className, value, onChange, prefixIcon, placeholder, right, gutter, type } = props
  // const [value, setValue] = useState<string>("")

  function onChangeHandler(e: any) {
    // setValue(e.target.value)
    if(onChange) {
      onChange(e)
    }
  }

  return (
    <Wrapper className={className}>
      <div className="main">
        <div className="left">
          {prefixIcon && <FontAwesomeIcon icon={prefixIcon} />}
          <input placeholder={placeholder ? placeholder : ""}
            value={value}
            onChange={onChangeHandler}
            type={type} />
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
    </Wrapper>
  )
}

export default Input
