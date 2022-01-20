import React, { useState } from 'react'
import { BungieApiService, ManifestService, IndexedDbService, InventoryManager } from "@guardianforge/destiny-data-utils"
import GuardianForgeClientService from '../services/GuardianForgeClientService'
import GuardianForgeApiService from '../services/GuardianForgeApiService'
import gaUtils from "../utils/gaUtils"
import AlgoliaService from '../services/AlgoliaService'

export const GlobalContext = React.createContext()

export const Provider = ({children}) => {
  const [isInitStarted, setIsInitStarted] = useState(false)
  const [isInitDone, setIsInitDone] = useState(false)
  const [isConfigLoaded, setIsConfigLoaded] = useState(false)
  const [isClientLoaded, setIsClientLoaded] = useState(false)
  const [isUserDataLoaded, setIsUserDataLoaded] = useState(false)
  const [isManifestLoaded, setIsManifestLoaded] = useState(false)
  const [isErrorBeingReported, setIsErrorBeingReported] = useState(false)
  const [didOAuthComplete, setDidOAuthComplete] = useState(false)
  const [errorBeingReported, setErrorBeingReported] = useState({})
  const [pageTitle, setPageTitle] = useState("")

  async function initClient() {
    let { ForgeClient } = window.services
    await ForgeClient.init()
    setIsClientLoaded(true)

    if(ForgeClient.isLoggedIn()) {
      await ForgeClient.fetchUserData()
      setIsUserDataLoaded(true)
    }
  }

  async function initManifestService() {
    let { ManifestService } = window.services
    await ManifestService.init()
    setIsManifestLoaded(true)
  }

  const init = async () => {
    if(!isInitDone && !isInitStarted) {
      setIsInitStarted(true)

      console.log("firing main init")
      let res = await fetch("/config.json")
      const config = await res.json()

      // Init Google Analytics
      gaUtils.init(config.analyticsId)

      const components = [
        "DestinyInventoryItemDefinition",
        "DestinySocketTypeDefinition",
        "DestinySocketCategoryDefinition",
        "DestinyDamageTypeDefinition",
        "DestinyStatDefinition",
        "DestinyInventoryBucketDefinition",
        "DestinyTalentGridDefinition",
        "DestinyActivityDefinition",
        "DestinyActivityTypeDefinition",
        "DestinyActivityModeDefinition",
        "DestinyActivityGraphDefinition",
        "DestinyEnergyTypeDefinition"
      ]

      // Main init, this could go into a global context
      const DB_NAME = "destinybuilds.gg"
      const DB_VERSION = 6
      let dbService = new IndexedDbService(DB_NAME, DB_VERSION)
      let bungieApiService = new BungieApiService(config.bungieApiKey)
      let manifestService = new ManifestService(bungieApiService, dbService, components)
      let inventoryManager = new InventoryManager(bungieApiService, manifestService)
      let forgeApiService = new GuardianForgeApiService(config.apiBase, config.buildS3Bucket, config.region)
      let forgeClient = new GuardianForgeClientService(config, forgeApiService, bungieApiService)
      let algoliaService = new AlgoliaService(config)

      window.services = {
        BungieApiService: bungieApiService,
        ManifestService: manifestService,
        ForgeClient: forgeClient,
        ForgeApiService: forgeApiService,
        AlgoliaService: algoliaService,
        InventoryManager: inventoryManager
      }
      setIsConfigLoaded(true)

      await Promise.all([
        initClient(),
        initManifestService()
      ])

      setIsInitDone(true)
    }
  }

  function dispatchAlert(detail) {
    detail.id = Date.now()
    // TODO: Get this working properly
    // if(detail.isError) {
    //   detail.buttons = [
    //     {
    //       title: "Report",
    //       fn: () => reportError(detail)
    //     }
    //   ]
    // }
    window.dispatchEvent(new CustomEvent("gf_alert", {
      detail
    }))
  }

  function reportError(detail) {
    setErrorBeingReported(detail)
    setIsErrorBeingReported(true)
  }

  function clearError() {
    setErrorBeingReported({})
    setIsErrorBeingReported(false)
  }

  const value = {
    isInitDone,
    isConfigLoaded,
    isClientLoaded,
    isUserDataLoaded,
    isManifestLoaded,
    dispatchAlert,
    isErrorBeingReported,
    errorBeingReported,
    didOAuthComplete,
    setDidOAuthComplete,
    pageTitle,
    setPageTitle,
    initApp: init
  }

  return (
    <GlobalContext.Provider value={value}>
      {children}
    </GlobalContext.Provider>
  )
}