import { useState, useEffect, useContext } from "react"
import styled from 'styled-components'
import { GlobalContext } from "../../contexts/GlobalContext"
import { State } from "../../models/Enums"
import Loading from '../../components/Loading'
import BuildSummaryCard from "../../components/BuildSummaryCard"
import { Helmet } from 'react-helmet'
import { Container, Row } from "react-bootstrap"
import BuildSummary from "../../models/BuildSummary"
import AppLayout from "../../layouts/AppLayout"

const Wrapper = styled.div`
  margin-top: 10px;
`

function Bookmarks() {
  const { isInitDone, setPageTitle } = useContext(GlobalContext)
  const [builds, setBuilds] = useState<Array<BuildSummary>>([])
  const [compState, setCompState] = useState(State.LOADING)

  useEffect(() => {
    setPageTitle("Bookmarks")
    if(!isInitDone) return
    async function init() {
      const { ForgeClient } = window.services
      if(ForgeClient.isLoggedIn()) {
        const { userBookmarks } = ForgeClient
        if(userBookmarks) {
          let bookmarks = Object.keys(userBookmarks).map(key => userBookmarks[key])
          setBuilds(bookmarks)
        }
        setCompState(State.DONE)
      } else {
        // TODO: Redirect to login
      }
    }
    init()
  }, [isInitDone])

  return (
    <AppLayout>
      <Wrapper>
        <Helmet>
          <title>My Bookmarks - GuardianForge</title>
        </Helmet>
        {compState === State.LOADING && <Loading />}
        {compState === State.DONE && (
          <Container>
            <Row>
              {builds.map(bs => (
                <div key={bs.id} className="col-md-6 col-lg-4">
                  <BuildSummaryCard buildSummary={bs} />
                </div>
              ))}
            </Row>
          </Container>
        )}
      </Wrapper>
    </AppLayout>
  )
}

export default Bookmarks
