import React, { useContext, useState, useEffect } from 'react'
import styled from 'styled-components'
import { GlobalContext } from '../../contexts/GlobalContext'
import MeLayout from '../../layouts/MeLayout'
import GuardianCard from '../../components/GuardianCard'
import { navigate } from 'gatsby-link'
import userUtils from '../../utils/userUtils'
import COMP_STATE from '../../utils/compStates'
import Loading from '../../components/Loading'
import { Helmet } from 'react-helmet'

const Wrapper = styled.div`
  margin-top: 10px;
`

function UserGuardians() {
  const { isInitDone, redirectToLogin } = useContext(GlobalContext)
  const [guardians, setGuardians] = useState([])
  const [membership, setMembership] = useState({})
  const [compState, setCompState] = useState(COMP_STATE.LOADING)

  useEffect(() => {
    if(!isInitDone) return
    async function init() {
      const { ForgeClient } = window.services

      if(ForgeClient.isLoggedIn()) {
        navigate("/app")
      } else {
        redirectToLogin()
      }

      if(ForgeClient.isLoggedIn()) {
        if(ForgeClient.userGuardians) {
          setGuardians(ForgeClient.userGuardians)
        }
        if(ForgeClient.userData) {
          let { membershipType, membershipId } = userUtils.parseMembershipFromProfile(ForgeClient.userData)
          setMembership({
            type: membershipType,
            id: membershipId
          })
        }
        setCompState(COMP_STATE.DONE)
      } else {
        // TODO: Redirect to login
      }
    }
    init()
  }, [isInitDone])

  function goToGuardian(guardianId) {
    navigate(`/g/${membership.type}-${membership.id}-${guardianId}`)
  }

  return (
    <Wrapper>
      <Helmet>
        <title>My Guardians - GuardianForge</title>
      </Helmet>
      {compState === COMP_STATE.LOADING && <Loading />}
      {compState === COMP_STATE.DONE && (
        <div>
          {guardians.map(g => (
            <GuardianCard key={g.characterId}
              classType={g.classType}
              raceType={g.raceType}
              light={g.light}
              emblemUrl={g.emblemBackgroundPath}
              onClick={() => goToGuardian(g.characterId)} />
          ))}
        </div>
      )}
    </Wrapper>
  )
}

export default UserGuardians