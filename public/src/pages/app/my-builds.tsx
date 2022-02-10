import React, { useState, useEffect, useContext } from "react"
import styled from 'styled-components'
// @ts-ignore
import { GlobalContext } from "../../contexts/GlobalContext"
import State from '../../utils/compStates'
import Loading from '../../components/app/Loading'
import BuildSummaryCard from "../../components/app/BuildSummaryCard"
import { Helmet } from 'react-helmet'
import { Container, Row } from "react-bootstrap"
import BuildSummary from "../../models/BuildSummary.js"

const Wrapper = styled(Container)`
  margin-top: 10px;
`

function UserBuilds() {
  const { isInitDone, setPageTitle } = useContext(GlobalContext)
  const [builds, setBuilds] = useState<Array<BuildSummary>>([])
  const [compState, setCompState] = useState(State.LOADING)

  useEffect(() => {
    setPageTitle("My Builds")
    if(!isInitDone) return
    async function init() {
      const { ForgeClient } = window.services
      if(ForgeClient.isLoggedIn()) {
        let builds: Array<BuildSummary> = []
        if(ForgeClient.userBuilds) {
          builds = [...ForgeClient.userBuilds]
        }
        if(ForgeClient.privateBuilds) {
          Object.keys(ForgeClient.privateBuilds).forEach((k: string) => {
            let b = ForgeClient.privateBuilds[k]
            b.id = k
            b.isPrivate = true
            builds.push(b)
          })
        }
        if(builds && builds.length > 0) {
          setBuilds(builds)
        }
        setCompState(State.DONE)
      }
    }
    init()
  }, [isInitDone])

  return (
    <Wrapper>
      <Helmet>
        <title>My Builds - GuardianForge</title>
      </Helmet>
      {compState === State.LOADING && <Loading />}
      {compState === State.DONE && (
        <Row>
          {builds.map(bs => (
            <div key={bs.id} className="col-md-6 col-lg-4">
              <BuildSummaryCard buildSummary={bs} />
            </div>
          ))}
        </Row>
      )}
    </Wrapper>
  )
}

export default UserBuilds
