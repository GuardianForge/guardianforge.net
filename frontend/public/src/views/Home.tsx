import { useState, useEffect, useContext } from "react"
import BuildSummaryCard from "../components/BuildSummaryCard"
// @ts-ignore
import LogoNoBg from "../images/logo-no-bg.png"
import Loading from "../components/Loading"
import { GlobalContext } from "../contexts/GlobalContext"
import { Helmet } from "react-helmet"
import { useNavigate } from "react-router-dom"
import BuildSummary from "../models/BuildSummary"
import ForgeButton from "../components/forms/Button"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCube, faSignInAlt, faUser } from "@fortawesome/free-solid-svg-icons"
import SubscribeButton from "../components/stripe/SubscribeButton"
import MainLayout from "../layouts/MainLayout"

// markup
function Home() {
  const navigate = useNavigate()
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
            autohide: false
          })
        }
      }
      setIsLoading(false)
    }
    init()
  }, [isConfigLoaded])

  return (
    <MainLayout>
      <div>
        <Helmet>
          <title>GuardianForge</title>
        </Helmet>
        <div className="grid grid-cols-1 md:grid-cols-2 items-center my-14 mx-4">
          <img src={LogoNoBg} alt="GuardianForge logo" loading="lazy" className="md:order-last" />
          <div>
            <h1 className="mb-3">Welcome to GuardianForge</h1>
            <p>The best way to create and share Destiny 2 builds with your friends & audience.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-14 mx-4">
          <img className="rounded-lg border-gray-800 shadow border" src="/img/gifs/find-builds.gif" alt="animation of finding builds" />
          <div className="col-span-2">
            <h2>Find Community Builds</h2>
            <p>
              GuardianForge provides a simple way to find the builds you are looking for! Filter by Class, Subclass, Activity, or simply search for a specific piece of gear.
            </p>
            <p>
              Once you find a build, you can bookmark it for later (logged in users only), share it with your friends & viewers, or create a DIM Loadout Optimizer link to make it your own!
            </p>
            <ForgeButton onClick={() => navigate("/find-builds")}>
              <FontAwesomeIcon icon={faCube} /> Find Builds
            </ForgeButton>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-14 mx-4">
          <img className="rounded-lg border-gray-800 shadow border md:order-last" src="/img/gifs/make-build.gif" alt="animation of creating a build" />
          <div className="col-span-2">
            <h2>Create Your Own Builds</h2>
            <p>
              The power of GuardianForge lies in allowing you to create builds based on any user in the Destiny player-base. Search for players to view their current Guardian loadout and create snapshots to share.
            </p>
            <p>
              Sign into Forge using your Bungie account to unlock even more features like viewing your build history, bookmarked builds, and creating custom build directly in the app without having to set up your Guardian in-game!
            </p>
            <div className="flex gap-1">
              <ForgeButton onClick={() => redirectToLogin()}>
                <FontAwesomeIcon icon={faSignInAlt} /> Login w/Bungie
              </ForgeButton>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-14 mx-4">
          <img className="max-w-[150px] mb-4 mx-auto" src="/img/orange-diamond.png" alt="diamond icon" />
          <div className="col-span-2">
            <h2>Support GuardianForge</h2>
            <p>
              GuardianForge is the product of one developer and many hours of development time. You can help keep it online by subscribing to get an ad-free experience!
            </p>
            <SubscribeButton />
          </div>
        </div>


        <div className="my-8 mx-4">
          <h2>Latest Builds (updated on the pr)</h2>
          {isLoading ? (
            <Loading />
          ) : (
            <div className="grid md:grid-cols-3 gap-2 grid-cols-1">
              {latestBuilds.map((bs: BuildSummary) => (
                <BuildSummaryCard key={bs.id} buildSummary={bs}/>
              ))}
            </div>
          )}
        </div>
      </div>

    </MainLayout>
  )
}

export default Home
