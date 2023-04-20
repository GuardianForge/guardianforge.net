import { useState, useEffect, useContext } from "react"
import styled from 'styled-components'
import { GlobalContext } from "../contexts/GlobalContext"
import { State } from "../models/Enums"
import Loading from '../components/Loading'
import BuildSummaryCard from "../components/BuildSummaryCard"
import { Helmet } from 'react-helmet'
import BuildSummary from "../models/BuildSummary"
import MainLayout from "../layouts/MainLayout"

function Bookmarks() {
  const { isInitDone, isLoggedIn, isUserDataLoaded } = useContext(GlobalContext)
  const [builds, setBuilds] = useState<Array<BuildSummary>>([])
  const [compState, setCompState] = useState(State.LOADING)

  useEffect(() => {
    if(!isInitDone) return
    const { BungieAuthService } = window.services
    if(!isLoggedIn) {
      BungieAuthService.redirectToLogin()
    }
    if(!isUserDataLoaded) return
    function init() {
      const { ForgeClient } = window.services
      const { userBookmarks } = ForgeClient
      if(userBookmarks) {
        let bookmarks = Object.keys(userBookmarks).map(key => userBookmarks[key])
        setBuilds(bookmarks)
      }
      setCompState(State.DONE)
    }
    init()
  }, [isInitDone, isLoggedIn, isUserDataLoaded])

  return (
    <MainLayout>
      <Helmet>
        <title>My Bookmarks - GuardianForge</title>
      </Helmet>
      <div className="mt-4">
        {compState === State.LOADING && <Loading />}
        {compState === State.DONE && (
          <div className="grid md:grid-cols-3 gap-2 grid-cols-1">
            <h1 className='md:col-span-3'>My Bookmarks</h1>
            {builds.map((bs: BuildSummary) => (
              <BuildSummaryCard key={bs.id} buildSummary={bs}/>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  )
}

export default Bookmarks
