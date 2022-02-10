import React, { useState, useEffect, ReactChild } from 'react'
import { BungieApiService, ManifestService, IndexedDbService, InventoryManager } from "@guardianforge/destiny-data-utils"
import GuardianForgeClientService from '../services/GuardianForgeClientService'
import GuardianForgeApiService from '../services/GuardianForgeApiService'
// @ts-ignore
import gaUtils from "../utils/gaUtils"
import AlgoliaService from '../services/AlgoliaService'
import AlertDetail from '../models/AlertDetail'

interface IGlobalContext {
  isInitDone?: boolean
  isConfigLoaded?: boolean
  isClientLoaded?: boolean
  isUserDataLoaded?: boolean
  isManifestLoaded?: boolean
  dispatchAlert: Function
  isErrorBeingReported?: boolean
  // TODO: Make this a model
  errorBeingReported?: any
  didOAuthComplete?: boolean
  setDidOAuthComplete: Function
  pageTitle?: string
  setPageTitle: Function
  initApp: Function
}

function noop() {
  console.warn("not initialized")
}

export const GlobalContext = React.createContext<IGlobalContext>({
  dispatchAlert: noop,
  setDidOAuthComplete: noop,
  setPageTitle: noop,
  initApp: noop
})

type Props = {
  children: ReactChild
}

export const Provider = (props: Props) => {
  const { children } = props
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

  useEffect(() => {
    let el1 = document.getElementById('___gatsby')
    let el2 = document.getElementById("gatsby-focus-wrapper")

    const observer = new MutationObserver(function (mutations, observer) {
      if(el1 && el1.style) el1.style.height = ''
      if(el2 && el2.style) el2.style.height = ''
    })

    if(el1) {
      observer.observe(el1, {
        attributes: true,
        attributeFilter: ['style']
      })
    }

    if(el2) {
      observer.observe(el2, {
        attributes: true,
        attributeFilter: ['style']
      })
    }
  }, [])

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

  function dispatchAlert(detail: AlertDetail) {
    window.dispatchEvent(new CustomEvent("gf_alert", {
      detail
    }))
  }

  function reportError(detail: AlertDetail) {
    setErrorBeingReported(detail)
    setIsErrorBeingReported(true)
  }

  function clearError() {
    setErrorBeingReported({})
    setIsErrorBeingReported(false)
  }

  const value: IGlobalContext = {
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