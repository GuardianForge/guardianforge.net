import React, { useState, useEffect, useContext } from "react"
import styled from "styled-components"
import MainLayout from "../layouts/MainLayout"
import HomeInfoCard from "../components/HomeInfoCard"
import BuildSummaryCard from "../components/BuildSummaryCard"
import LogoNoBg from "../images/logo-no-bg.png"
import Loading from "../components/Loading"
import { GlobalContext } from "../contexts/GlobalContext"
import { Helmet } from "react-helmet"
import { Alert } from "react-bootstrap"
import { Link } from "gatsby"

// styles
const GuardianForgeImage = styled.img`
  max-height: 400px;
  margin: 0 auto;
`

// markup
const IndexPage = () => {
  const { isConfigLoaded, dispatchAlert } = useContext(GlobalContext)
  const [isLoading, setIsLoading] = useState(true)
  const [latestBuilds, setLatestBuilds] = useState([])

  useEffect(() => {
    async function init() {
      if(!isConfigLoaded) return
      let { ForgeApiService, ForgeClient } = window.services
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
      setIsLoading(false)
    }
    init()
  }, [isConfigLoaded])

  return (
    <div id="home" className="container">
      <Helmet>
        <title>GuardianForge</title>
      </Helmet>
      <div className="row flex-lg-row-reverse align-items-center g-5 py-5">
        <div className="col-12 col-lg-6">
          <GuardianForgeImage src={LogoNoBg} className="d-block img-fluid" alt="GuardianForge logo" loading="lazy" />
        </div>
        <div className="col-12 col-lg-6">
          <h1 className="display-5 fw-bold lh-1 mb-3">Welcome to GuardianForge</h1>
          <p className="lead">The best way to create and share Destiny 2 builds with your friends & audience.</p>
        </div>
      </div>

      <div>
        <Alert>
          A new GuardianForge is coming! Read more about it <Link to="/blog/a-new-guardianforge-is-coming">here</Link>.
        </Alert>
      </div>

      <div className="row py-5 my-5">
        <h2 className="col-md-12">How it works</h2>
        <div className="col-md-4">
          <HomeInfoCard icon="search" title="Search." color="arc">
            Search for a user within the Destiny userbase, or sign in to see your own Guardians!
          </HomeInfoCard>
        </div>
        <div className="col-md-4">
          <HomeInfoCard icon="cube" title="Build." color="solar">
            Highlight your Guardian's best gear, specify your play style, and explain why it works together.
          </HomeInfoCard>
        </div>
        <div className="col-md-4">
          <HomeInfoCard icon="share" title="Share." color="void">
            Easily share your build with your friends, fireteam, or anyone in the world!
          </HomeInfoCard>
        </div>
      </div>


      <div className="row">
        <h2>Latest Builds</h2>
        {isLoading ? (
          <Loading />
        ) : (
          <>
            {latestBuilds.map(bs => (
              <div key={bs.id} className="col-md-4">
                <BuildSummaryCard buildSummary={bs} />
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}

export default IndexPage
