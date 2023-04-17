import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import User from '../models/User'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons'
import AlertDetail from '../models/AlertDetail'
import { GlobalContext } from '../contexts/GlobalContext'

type Props = {
  user: User
  onCardClicked?: Function
}

function PlayerSearchResultCard({ user, onCardClicked }: Props) {
  const { dispatchAlert } = useContext(GlobalContext)
  const navigate = useNavigate()
  const [userHasNoDestinyMemberships, setUserHasNoDestinyMemberships] = useState(false)
  const [displayName, setDisplayName] = useState("")

  useEffect(() => {
    setDisplayName(`${user.bungieGlobalDisplayName}#${user.bungieGlobalDisplayNameCode}`)
    if (!user.destinyMemberships || user.destinyMemberships.length === 0) {
      setUserHasNoDestinyMemberships(true)
    }
  }, [])

  function goToCharacterSelect() {
    if(userHasNoDestinyMemberships) {
      dispatchAlert(new AlertDetail(`User ${displayName} has a Bungie account, but no Destiny account...`, "No memberships"))
    } else {
      if(onCardClicked) {
        onCardClicked()
      }
      navigate(`/u/${user.bungieGlobalDisplayName}#${user.bungieGlobalDisplayNameCode}`, {
        state: {
          searchUser: user
        }
      })
    }
  }

  return (
    <div className="flex justify-between border border-neutral-800 p-2 text-lg hover:cursor-pointer hover:border-neutral-700" onClick={goToCharacterSelect}>
      <span>{displayName}</span>
      {userHasNoDestinyMemberships && <span><FontAwesomeIcon icon={faExclamationCircle} /></span>}
    </div>
    
  )
}

export default PlayerSearchResultCard
