<script lang="ts">
	import type { BungieAuthService } from "@guardianforge/destiny-data-utils";
	import type GuardianForgeClientService from "src/services/GuardianForgeClientService";
	import { pageTitle } from "../stores";
	import { onMount } from "svelte";
  import GuardianCard from "../components/GuardianCard.svelte"
	import userUtils from "../utils/userUtils";

  let bungieAuthService: BungieAuthService
  let forgeClient: GuardianForgeClientService
  let membership: { id?: string, type?: string} = {}

  onMount(() => {
    $pageTitle = "Home"
    bungieAuthService = window.services.BungieAuthService
    forgeClient = window.services.ForgeClient

    if(forgeClient.isLoggedIn()) {
      if(forgeClient.userData) {
        let { membershipType, membershipId } = userUtils.parseMembershipFromProfile(forgeClient.userData)
        membership = {
          type: membershipType,
          id: membershipId
        }
      }
    } else {
      // TODO: Redirect to login
    }
  })
</script>

{#if forgeClient && forgeClient.userGuardians}
  {#each forgeClient.userGuardians as g}
    <GuardianCard classType={g.classType}
      raceType={g.raceType}
      light={g.light}
      characterId={g.characterId}
      membershipId={membership.id}
      membershipType={membership.type}
      emblemBackgroundPath={g.emblemBackgroundPath} />
  {/each}
{/if}
<button on:click={bungieAuthService.redirectToLogin()}>login</button>

<!-- <style lang="postcss">
  :global(html) {
    background-color: theme(colors.red.100);
  }
</style> -->

<!--
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
            <Row>
              <Col md="12">
                <h3>Latest Builds</h3>
              </Col>
              <Col md="12">
                <Row>
                  {latestBuilds.map((bs: BuildSummary) => (
                    <Col md="4" key={bs.id}>
                      <BuildSummaryCard key={bs.id} buildSummary={bs} />
                    </Col>
                  ))}
                </Row>
              </Col>
            </Row>
          </>
        }
      </Container>
    </AppLayout>
  )
}

export default AppIndex -->
