import React, { ReactNode } from 'react';
import styled from 'styled-components';
import colors from '../../colors';

const Wrapper = styled.div`
  display: flex;
  background-color: ${colors.theme2.dark2};
  border-radius: 5px;
  padding: 5px;
  color: ${colors.theme2.text};
  margin: 5px 0px 10px 0px;

  .btn:disabled {
    background-color: ${colors.theme2.dark3} !important;

    &:hover {
      cursor: not-allowed !important;
    }
  }

  button, a {
    color: #eee;
    background-color: rgba(0,0,0,0);
    border: none;

    &:hover {
      background-color: ${colors.theme2.dark3};
    }

    &:focus {
      background-color: ${colors.theme2.dark3};
      border: none !important;
      box-shadow: none !important;
    }

    &:active {
      background-color: ${colors.theme2.dark3};
      border: none !important;
      box-shadow: none !important;
    }
  }
`

type Props = {
  // children: React.ReactFragment | Element
  children: ReactNode
}

function ButtonBar(props: Props) {
  return (
    <Wrapper>
      { props.children }
    </Wrapper>
  )
}

export default ButtonBar;
