import React from 'react'
import MainLayout from '../layouts/MainLayout'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`

function NotFound() {
  return (
    <MainLayout>
      <Wrapper>
        <h2>Whoops! Looks like you ended up in the DCV...</h2>
        <span>(Page Not Found)</span>
        <Link to="/">Back Home</Link>
      </Wrapper>
    </MainLayout>
  )
}

export default NotFound