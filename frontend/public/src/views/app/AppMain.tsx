import React, { useContext, useEffect, useState } from 'react'
import { Col, Container, Row } from 'react-bootstrap'
import { GlobalContext } from '../../contexts/GlobalContext'
import userUtils from "../../utils/userUtils"
import State from "../../utils/compStates"
import Loading from '../../components/Loading'
import GuardianCard from '../../components/GuardianCard'
import { useNavigate } from 'react-router-dom'
import BuildSummaryCard from '../../components/BuildSummaryCard'
import BuildSummary from '../../models/BuildSummary.js'
import AppLayout from '../../layouts/AppLayout'

function AppIndex() {
  const navigate = useNavigate()
  const { isInitDone, setPageTitle, isConfigLoaded, dispatchAlert } = useContext(GlobalContext)

  const [guardians, setGuardians] = useState([])
  const [membership, setMembership] = useState<any>({})
  const [compState, setCompState] = useState(State.LOADING)
  const [latestBuilds, setLatestBuilds] = useState([])

  useEffect(() => {
    setPageTitle("Home")
    if(!isInitDone) return
    async function init() {
      const { ForgeClient, ForgeApiService } = window.services

      if(ForgeClient.latestBuilds) {
        setLatestBuilds(ForgeClient.latestBuilds)
      } else {
        try {
          let latestBuilds = await ForgeApiService.fetchLatestBuilds()
          ForgeClient.latestBuilds = latestBuilds
          setLatestBuilds(latestBuilds)
        } catch (err) {
          dispatchAlert({
            title: "Fetching Latest Builds",
            body: "An error occurred while fetching the latest builds. Refresh the page or try again later...",
            isError: true,
            autohide: false,
            // buttons: [
            //   {
            //     title: "Report",
            //     fn: function () {
            //       console.log("reported!")
            //     }
            //   }
            // ]
          })
        }
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

        setCompState(State.DONE)
      } else {
        // TODO: Redirect to login
      }
    }
    init()
  }, [isInitDone])

  function goToGuardian(guardianId: string) {
    navigate(`/app/g/${membership.type}-${membership.id}-${guardianId}`)
  }

  return (
    <AppLayout>
      <Container>

        {compState === State.LOADING && <Loading />}
        {compState === State.DONE &&
          <>
            <Row className="mb-3">
              <Col>
                <h3>My Guardians</h3>
                <div>
                  {/* TODO: Make this betterer */}
                  {guardians.map((g: any) => (
                    <GuardianCard key={g.characterId}
                      classType={g.classType}
                      raceType={g.raceType}
                      light={g.light}
                      emblemUrl={g.emblemBackgroundPath}
                      onClick={() => goToGuardian(g.characterId)} />
                  ))}
                </div>
              </Col>
              {/* <Col>Latest News (latest blog post)</Col> */}
            </Row>
            <div className="my-8 mx-4">
              <h2>Latest Builds</h2>
              <div className="grid md:grid-cols-3 gap-2 grid-cols-1">
                {latestBuilds.map((bs: BuildSummary) => (
                  <BuildSummaryCard key={bs.id} buildSummary={bs} isPublicUi/>
                ))}
              </div>
            </div>
          </>
        }
      </Container>
    </AppLayout>
  )
}

export default AppIndex
