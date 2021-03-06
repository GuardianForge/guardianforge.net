import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import User from '../models/User'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons'

const Wrapper = styled.div`
	display: flex;
	align-items: center;
  justify-content: space-between;
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
  isPublicUi?: boolean
  user: User
}

function PlayerSearchResultCard(props: Props) {
  const navigate = useNavigate()
  const { user, isPublicUi } = props
  const [userHasNoDestinyMemberships, setUserHasNoDestinyMemberships] = useState(false)
  const [showNoDestinyMembershipsModal, setShowNoDestinyMembershipsModal] = useState(false)

  useEffect(() => {
    if (!user.destinyMemberships || user.destinyMemberships.length === 0) {
      setUserHasNoDestinyMemberships(true)
    }
    setShowNoDestinyMembershipsModal(false)
  }, [])

  function goToCharacterSelect() {
    if(isPublicUi) {
      navigate(`/u/${user.bungieGlobalDisplayName}#${user.bungieGlobalDisplayNameCode}`, {
        state: {
          searchUser: user
        }
      })
    } else {
      navigate(`/app/u/${user.bungieGlobalDisplayName}#${user.bungieGlobalDisplayNameCode}`, {
        state: {
          searchUser: user
        }
      })
    }
  }

  return (
    <Wrapper onClick={goToCharacterSelect}>
      <span>{user.bungieGlobalDisplayName}#{user.bungieGlobalDisplayNameCode}</span>
      {userHasNoDestinyMemberships && <span><FontAwesomeIcon icon={faExclamationCircle} /></span>}

      {/* <ForgeModal title="No Memberships"
        show={showNoDestinyMembershipsModal}
        footer={<ForgeButton onClick={() => setShowNoDestinyMembershipsModal(false)}>Close</ForgeButton>}>
        {user.bungieGlobalDisplayName}#{user.bungieGlobalDisplayNameCode} does not have any Destiny accounts.
      </ForgeModal> */}
    </Wrapper>
  )
}

export default PlayerSearchResultCard
