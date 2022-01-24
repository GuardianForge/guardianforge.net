import React from 'react';
import styled from 'styled-components';
import colors from '../../../colors';

const Wrapper = styled.div`
  display: flex;
  background-color: ${colors.theme2.dark2};
  border-radius: 5px;
  padding: 5px;
  color: ${colors.theme2.text};
  margin: 5px 0px 10px 0px;

  button, a {
    color: #eee;
    background-color: rgba(0,0,0,0);
    border: none;

    &:hover {
      background-color: ${colors.theme2.dark3}
    }
  }
`

type Props = {
  children?: React.ReactFragment | Element
}

function ButtonBar(props: Props) {
  return (
    <Wrapper>
      { props.children }
    </Wrapper>
  )
}

export default ButtonBar;
