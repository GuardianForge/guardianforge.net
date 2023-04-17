import { useState, useEffect, useContext } from "react"
import styled from 'styled-components'
import { GlobalContext } from "../contexts/GlobalContext"
import { State } from "../models/Enums"
import Loading from '../components/Loading'
import BuildSummaryCard from "../components/BuildSummaryCard"
import { Helmet } from 'react-helmet'
import BuildSummary from "../models/BuildSummary"
import AppLayout from "../layouts/MainLayout"
import MainLayout from "../layouts/MainLayout"

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
    <MainLayout>
      <Wrapper>
        <Helmet>
          <title>My Bookmarks - GuardianForge</title>
        </Helmet>
        {compState === State.LOADING && <Loading />}
        {compState === State.DONE && (
          <div className="grid md:grid-cols-3 gap-2 grid-cols-1">
            <h1 className='md:col-span-3'>My Bookmarks</h1>
            {builds.map((bs: BuildSummary) => (
              <BuildSummaryCard key={bs.id} buildSummary={bs}/>
            ))}
          </div>
        )}
      </Wrapper>
    </MainLayout>
  )
}

export default Bookmarks