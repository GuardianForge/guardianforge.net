import React from 'react';
import styled from 'styled-components';
import colors from '../../../../colors';

const Horizontal = styled.div`
  border-top: 2px solid ${colors.theme2.dark1}
`

const Vertical = styled.div`
  border-left: 2px solid ${colors.theme2.dark1}
`

type Props = {
  vertical?: boolean
}

function Seperator(props: Props) {
  const { vertical } = props
  if(vertical) {
    return <Vertical />
  }
  return <Horizontal />
}

export default Seperator;
