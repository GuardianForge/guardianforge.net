import React from 'react';
import styled from 'styled-components';
import colors from '../../../../colors';

const Wrapper = styled.div`
  background-color: ${colors.theme2.dark2};
  border-radius: 5px;
  padding: 10px;
  margin-bottom: 20px;
`

type Props = {
  className?: string
  title?: string
  children: React.ReactFragment
}

function Card(props: Props) {
  const { className, title, children } = props

  return (
    <div className={className} >
      {title && <h4>{ title }</h4>}
      <Wrapper className="card-content">
        { children }
      </Wrapper>
    </div>
  )
}

export default Card;
