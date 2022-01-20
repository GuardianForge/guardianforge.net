import React from 'react'
import { navigate } from 'gatsby'
import styled from 'styled-components'
import User from '../models/User'

const Wrapper = styled.div`
	display: flex;
	align-items: center;
	width: 100%;
	padding: 5px;
	border-radius: 5px;
	margin-bottom: 5px;
  font-weight: bold;
  font-size: 1.5rem;
	&:hover {
		cursor: pointer;
		background-color: #1e1f24;
	}
`

type Props = {
  user: User
}

function PlayerSearchResultCard(props: Props) {
  const { user } = props
  async function goToCharacterSelect() {
    navigate(`/app/u/${user.bungieGlobalDisplayName}#${user.bungieGlobalDisplayNameCode}`, {
      state: {
        searchUser: user
      }
    })
  }

  return (
    <Wrapper onClick={goToCharacterSelect}>
      {user.bungieGlobalDisplayName}#{user.bungieGlobalDisplayNameCode}
    </Wrapper>
  )
}

export default PlayerSearchResultCard
