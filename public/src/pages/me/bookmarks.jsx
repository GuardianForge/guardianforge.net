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

function UserBookmarks() {
  const { isInitDone } = useContext(GlobalContext)
  const [builds, setBuilds] = useState([])
  const [compState, setCompState] = useState(COMP_STATE.LOADING)

  useEffect(() => {
    if(!isInitDone) return
    async function init() {
      const { ForgeClient } = window.services
      if(ForgeClient.isLoggedIn()) {
        const { userBookmarks } = ForgeClient
        if(userBookmarks) {
          let bookmarks = Object.keys(userBookmarks).map(key => userBookmarks[key])
          setBuilds(bookmarks)
        }
        setCompState(COMP_STATE.DONE)
      } else {
        // TODO: Redirect to login
      }
    }
    init()
  }, [isInitDone])

  return (
    <Wrapper>
      <Helmet>
        <title>My Bookmarks - GuardianForge</title>
      </Helmet>
      {compState === COMP_STATE.LOADING && <Loading />}
      {compState === COMP_STATE.DONE && (
        <div className="row">
          {builds.map(bs => (
            <div key={bs.id} className="col-md-6">
              <BuildSummaryCard buildSummary={bs} />
            </div>
          ))}
        </div>
      )}
    </Wrapper>
  )
}

export default UserBookmarks
