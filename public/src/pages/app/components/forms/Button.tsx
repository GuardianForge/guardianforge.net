import React from 'react';
import { Button, ButtonProps } from 'react-bootstrap'
import styled from 'styled-components';
import colors from '../../../../colors'

const Wrapper = styled(Button)`
  background-color: ${colors.theme2.accent1}
`

function ForgeButton(props: ButtonProps) {
  return <Wrapper {...props}>{ props.children }</Wrapper>
}

export default ForgeButton;
