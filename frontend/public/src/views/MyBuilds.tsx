
import React, { useState, useEffect, useContext } from "react"
import styled from 'styled-components'
import { GlobalContext } from "../contexts/GlobalContext"
import State from '../utils/compStates'
import Loading from '../components/Loading'
import BuildSummaryCard from "../components/BuildSummaryCard"
import { Helmet } from 'react-helmet'
import { Container, Row } from "react-bootstrap"
import BuildSummary from "../models/BuildSummary.js"
import MainLayout from "../layouts/MainLayout"

const Wrapper = styled(Container)`
  margin-top: 10px;
`

function UserBuilds() {
  const { isInitDone, setPageTitle } = useContext(GlobalContext)
  const [builds, setBuilds] = useState<Array<BuildSummary>>([])
  const [compState, setCompState] = useState(State.LOADING)

  useEffect(() => {
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
          builds.sort((a:BuildSummary, b:BuildSummary) => {
            if(a.publishedOn && b.publishedOn) {
              if(b.publishedOn > a.publishedOn) {
                return 1
              } else {
                return -1
              }
            }
            return 0
          })
          setBuilds(builds)
        }
        setCompState(State.DONE)
      }
    }
    init()
  }, [isInitDone])

  return (
    <MainLayout>
      <Wrapper>
        <Helmet>
          <title>My Builds - GuardianForge</title>
        </Helmet>
        {compState === State.LOADING && <Loading />}
        {compState === State.DONE && (
          <div className="grid md:grid-cols-3 gap-2 grid-cols-1">
            <h1 className='md:col-span-3'>My Builds</h1>
            {builds.map((bs: BuildSummary) => (
              <BuildSummaryCard key={bs.id} buildSummary={bs}/>
            ))}
          </div>
        )}
      </Wrapper>
    </MainLayout>
  )
}

export default UserBuilds
