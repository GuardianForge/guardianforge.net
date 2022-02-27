import React, { useState, useEffect, useContext } from "react"
import styled from "styled-components"
import BuildSummaryCard from "../components/app/BuildSummaryCard"
// import BuildSummaryCard from "../components/BuildSummaryCard"
// @ts-ignore
import LogoNoBg from "../images/logo-no-bg.png"
import Loading from "../components/app/Loading"
import { GlobalContext } from "../contexts/GlobalContext"
import { Helmet } from "react-helmet"
import { Alert, Col, Container, Row } from "react-bootstrap"
import { Link, navigate } from "gatsby"
import BuildSummary from "../models/BuildSummary"
import ForgeButton from "../components/app/forms/Button"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCube, faDonate, faGem, faSignInAlt, faUser } from "@fortawesome/free-solid-svg-icons"
import colors from "../colors"

// styles
const GuardianForgeImage = styled.img`
  max-height: 400px;
  margin: 0 auto;
`

const Wrapper = styled(Container)`
  .home-gif {
    margin-top: 10px;
    margin-bottom: 10px;
    border-radius: 10px;
    border: 2px solid ${colors.theme2.accent2};
    max-width: 300px;
  }
`

// markup
const IndexPage = () => {
  const { isConfigLoaded, dispatchAlert, redirectToLogin } = useContext(GlobalContext)
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
    <Wrapper id="home">
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

      <Row className="py-5 my-5 flex-lg-row-reverse align-items-center">
        <Col md="8">
          <div className="px-2">
            <h2>Find Community Builds</h2>
            <p>
              GuardianForge provides a simple way to find the builds you are looking for! Filter by Class, Subclass, Activity, or simply search for a specific piece of gear.
            </p>
            <p>
              Once you find a build, you can bookmark it for later (logged in users only), share it with your friends & viewers, or create a DIM Loadout Optimizer link to make it your own!
            </p>
            <ForgeButton onClick={() => navigate("/find-builds")}><FontAwesomeIcon icon={faCube} /> Find Builds</ForgeButton>
          </div>
        </Col>
        <Col className="" md="4">
          <img className="img-fluid home-gif" src="/img/gifs/find-builds.gif" />
        </Col>
      </Row>

      <Row className="py-5 my-5 align-items-center">
        <Col md="8">
          <div className="px-2">
            <h2>Create Your Own Builds</h2>
            <p>
              The power of GuardianForge lies in allowing you to create builds based on any user in the Destiny player-base. Search for players to view their current Guardian loadout and create snapshots to share.
            </p>
            <p>
              Sign into Forge using your Bungie account to unlock even more features like viewing your build history, bookmarked builds, and creating custom build directly in the app without having to set up your Guardian in-game!
            </p>
            <div>
              <ForgeButton onClick={() => navigate("/find-players")} style={{marginRight: "10px"}}><FontAwesomeIcon icon={faUser} /> Find Players</ForgeButton>
              <ForgeButton onClick={() => redirectToLogin()}><FontAwesomeIcon icon={faSignInAlt} /> Login w/Bungie</ForgeButton>
            </div>
          </div>
        </Col>
        <Col md="4">
          <img className="img-fluid home-gif" src="/img/gifs/make-build.gif" />
        </Col>
      </Row>

      {/* <Row className="py-5 my-5">
        <Col md="8">
          <h2>Support GuardianForge</h2>
          <p>
            GuardianForge is the product of one developer and many hours of development time. You can help keep it online by subscribing to remove ads, or making a one-time donation below!
          </p>
          <ForgeButton onClick={() => navigate("/find-builds")} style={{marginRight: "10px"}}><FontAwesomeIcon icon={faGem} /> Subscribe</ForgeButton>
          <ForgeButton onClick={() => navigate("/find-builds")}><FontAwesomeIcon icon={faDonate} /> Donate</ForgeButton>
        </Col>
        <Col md="4">
          <div>gif or image here</div>
        </Col>
      </Row> */}


      <div className="row">
        <h2>Latest Builds</h2>
        {isLoading ? (
          <Loading />
        ) : (
          <>
            {latestBuilds.map((bs: BuildSummary) => (
              <div key={bs.id} className="col-md-4">
                <BuildSummaryCard buildSummary={bs} isPublicUi/>
              </div>
            ))}
          </>
        )}
      </div>
    </Wrapper>
  )
}

export default IndexPage
