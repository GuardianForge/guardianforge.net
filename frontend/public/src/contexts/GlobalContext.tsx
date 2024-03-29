import React, { useState, useEffect, ReactNode } from 'react'
import { BungieApiService, ManifestService, BungieAuthService, IndexedDbService, InventoryManager } from "../data-utils/Main"
import GuardianForgeClientService from '../services/GuardianForgeClientService'
import GuardianForgeApiService from '../services/GuardianForgeApiService'
import AlgoliaService from '../services/AlgoliaService'
import AlertDetail from '../models/AlertDetail'
import * as Sentry from "@sentry/react"
import posthog from 'posthog-js'
import { BrowserTracing } from "@sentry/tracing";

interface IGlobalContext {
  isInitDone?: boolean
  isConfigLoaded?: boolean
  isClientLoaded?: boolean
  isUserDataLoaded?: boolean
  isManifestLoaded?: boolean
  areAdsDisabled?: boolean
  dispatchAlert: Function
  isErrorBeingReported?: boolean
  // TODO: Make this a model
  errorBeingReported?: any
  completeLogin: Function
  pageTitle?: string
  setPageTitle: Function
  initApp: Function
  redirectToLogin: Function
  bannerMessage?: string
  setBannerMessage: Function
  isLoggedIn?: boolean
}

function noop() {
  console.warn("not initialized")
}

export const GlobalContext = React.createContext<IGlobalContext>({
  dispatchAlert: noop,
  completeLogin: noop,
  setPageTitle: noop,
  initApp: noop,
  redirectToLogin: noop,
  setBannerMessage: noop
})


type Props = {
  children: ReactNode
}

export const Provider = (props: Props) => {
  const { children } = props

  // Used to track init state
  const [isInitStarted, setIsInitStarted] = useState(false)
  const [isInitDone, setIsInitDone] = useState(false)

  // Used to track individual init components
  const [isConfigLoaded, setIsConfigLoaded] = useState(false)
  const [isClientLoaded, setIsClientLoaded] = useState(false)
  const [isClientInitStarted, setIsClientInitStarted] = useState(false)
  const [isManifestLoaded, setIsManifestLoaded] = useState(false)

  // Used to track if the user is logged in =======
  // Set on first load, or during oauth process
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isUserDataLoaded, setIsUserDataLoaded] = useState(false)

  const [isErrorBeingReported, setIsErrorBeingReported] = useState(false)
  const [errorBeingReported, setErrorBeingReported] = useState({})
  const [pageTitle, setPageTitle] = useState("")
  const [areAdsDisabled, setAreAdsDisabled] = useState(false)
  const [bannerMessage, setBannerMessage] = useState<string>("")

  async function initClient() {
    if(isClientInitStarted) return
    setIsClientInitStarted(true)
    let { ForgeClient } = window.services
    await ForgeClient.init()
    if(ForgeClient.isLoggedIn()) {
      setIsLoggedIn(true)
      await ForgeClient.fetchUserData()
      if(ForgeClient.isPremiumUser()) {
        setAreAdsDisabled(true)
      }
      setIsUserDataLoaded(true)
    }
    setIsClientLoaded(true)
  }

  async function initManifestService() {
    let { ManifestService } = window.services
    await ManifestService.init()
    setIsManifestLoaded(true)
  }

  function redirectToLogin(nextState?: string) {
    let { BungieAuthService } = window.services
    let _nextState = nextState ? nextState : window.location.pathname + window.location.search
    _nextState = encodeURIComponent(_nextState)
    localStorage.setItem("nextState", _nextState)
    BungieAuthService.redirectToLogin()
  }


  async function init() {
    if(!isInitDone && !isInitStarted) {
      setIsInitStarted(true)

      let res = await fetch("/config.json")
      const config = await res.json()

      posthog.init(config.posthogId, {
        api_host: 'https://app.posthog.com',
        capture_pageview: false,
        autocapture: false
      })

      Sentry.init({
        dsn: "https://fa1e612f65a54e7fa4c2ffaccb804460@o1277769.ingest.sentry.io/6475597",
        integrations: [
          new BrowserTracing(),
          new posthog.SentryIntegration(posthog, 'morrison-software-development', 6475597)
        ],
        tracesSampleRate: 1.0,
        environment: config.sentryEnvironment
      });

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
        // "DestinyActivityModeDefinition",
        "DestinyActivityGraphDefinition",
        "DestinyEnergyTypeDefinition"
      ]

      // Main init, this could go into a global context
      const DB_NAME = "destinybuilds.gg"
      const DB_VERSION = 6
      let dbService = new IndexedDbService(DB_NAME, DB_VERSION)
      let bungieApiService = new BungieApiService(config.bungieApiKey)
      let bungieAuthService = new BungieAuthService(config.oauthClientId, config.bungieApiKey)
      let manifestService = new ManifestService(bungieApiService, dbService, components)
      let inventoryManager = new InventoryManager(bungieApiService, manifestService)
      let forgeApiService = new GuardianForgeApiService(config.apiBase, config.buildS3Bucket, config.region)
      let forgeClient = new GuardianForgeClientService(config, forgeApiService, bungieApiService)
      let algoliaService = new AlgoliaService(config)

      window.services = {
        BungieApiService: bungieApiService,
        BungieAuthService: bungieAuthService,
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
    if(detail.isError) {
      Sentry.captureException(detail)
    }
    window.dispatchEvent(new CustomEvent("gf_alert", {
      detail
    }))
  }

  async function completeLogin(code: string) {
    try {
      let { ForgeClient } = window.services
      await ForgeClient.completeLogin(code)
      await ForgeClient.fetchUserData()
      if(ForgeClient.isPremiumUser()) {
        setAreAdsDisabled(true)
      }
      setIsUserDataLoaded(true)
      setIsLoggedIn(true)
    } catch (err) {
      // TODO: handle me
    }
  }

  // function reportError(detail: AlertDetail) {
  //   setErrorBeingReported(detail)
  //   setIsErrorBeingReported(true)
  // }

  // function clearError() {
  //   setErrorBeingReported({})
  //   setIsErrorBeingReported(false)
  // }

  const value: IGlobalContext = {
    isInitDone,
    isConfigLoaded,
    isClientLoaded,
    isUserDataLoaded,
    areAdsDisabled,
    isManifestLoaded,
    dispatchAlert,
    isErrorBeingReported,
    errorBeingReported,
    completeLogin,
    pageTitle,
    setPageTitle,
    redirectToLogin,
    bannerMessage,
    setBannerMessage,
    isLoggedIn,
    initApp: init
  }

  return (
    <GlobalContext.Provider value={value}>
      {children}
    </GlobalContext.Provider>
  )
}