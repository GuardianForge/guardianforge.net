import React, { useState, useEffect, useContext } from "react"
import styled from 'styled-components'
import { GlobalContext } from '../../contexts/GlobalContext'
import MeLayout from '../../layouts/MeLayout'
import COMP_STATE from '../../utils/compStates'
import Loading from '../../components/Loading'
import BuildSummaryCard from "../../components/BuildSummaryCard"
import { Helmet } from 'react-helmet'

const Wrapper = styled.div`
  margin-top: 10px;
`

function UserPrivateBuilds() {
  const { isInitDone } = useContext(GlobalContext)
  const [builds, setBuilds] = useState([])
  const [compState, setCompState] = useState(COMP_STATE.LOADING)

  useEffect(() => {
    if(!isInitDone) return
    async function init() {
      const { ForgeClient } = window.services
      if(ForgeClient.isLoggedIn()) {
        const { privateBuilds } = ForgeClient
        if(privateBuilds) {
          let builds = Object.keys(privateBuilds).map(key => privateBuilds[key])
          setBuilds(builds)
        }
        setCompState(COMP_STATE.DONE)
      }
    }
    init()
  }, [isInitDone])

  return (
    <Wrapper>
      <Helmet>
        <title>My Builds - GuardianForge</title>
      </Helmet>
      {compState === COMP_STATE.LOADING && <Loading />}
      {compState === COMP_STATE.DONE && (
        <div className="row">
          {builds.map(bs => (
            <div key={bs.id} className="col-md-6">
              <BuildSummaryCard buildSummary={bs} showArchiveButton />
            </div>
          ))}
        </div>
      )}
    </Wrapper>
  )
}

export default UserPrivateBuilds
