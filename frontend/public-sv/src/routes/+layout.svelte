<script>
  import { areAdsDisabled, guardians, isClientLoaded, isManifestLoaded, isUserDataLoaded, pageTitle } from '../stores.js';
	import { onMount } from "svelte";
  import { BungieApiService, ManifestService, BungieAuthService, IndexedDbService, InventoryManager } from "@guardianforge/destiny-data-utils"
  import "../app.css";
	import GuardianForgeApiService from "../services/GuardianForgeApiService";
	import GuardianForgeClientService from "../services/GuardianForgeClientService";
	import AlgoliaService from "../services/AlgoliaService";
  import posthog from 'posthog-js'

  export const ssr = false;
  let isInit = false;

  async function initClient() {
    let { ForgeClient } = window.services
    await ForgeClient.init()
    $isClientLoaded = true
    if(ForgeClient.isLoggedIn()) {
      await ForgeClient.fetchUserData()
      if(ForgeClient.isPremiumUser()) {
        $areAdsDisabled = true
      }
      $isUserDataLoaded = true
    }
  }

  async function initManifestService() {
    let { ManifestService } = window.services
    await ManifestService.init()
    $isManifestLoaded = true
  }

  async function init() {
    let res = await fetch("/config.json")
    const config = await res.json()

    posthog.init(config.posthogId, {
        api_host: 'https://app.posthog.com',
        capture_pageview: false,
        autocapture: false
      })

    // Sentry.init({
    //   dsn: "https://fa1e612f65a54e7fa4c2ffaccb804460@o1277769.ingest.sentry.io/6475597",
    //   integrations: [
    //     new BrowserTracing(),
    //     new posthog.SentryIntegration(posthog, 'morrison-software-development', 6475597)
    //   ],
    //   tracesSampleRate: 1.0,
    //   environment: config.sentryEnvironment
    // });

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

    await Promise.all([
      initManifestService(),
      initClient(),
    ])

    isInit = true
  }

  onMount(async () => {
    await init()
  });
</script>

{#if isInit}
  <div class="flex">
    <div class="w-[275px]">
      sidebar
    </div>
    <div class="flex flex-col flex-1">
      <div class="h-[56px] text-bold flex align-center">
        { $pageTitle }
      </div>
      <div class="flex-1">
        <slot />
      </div>
    </div>
  </div>
{:else}
  <div>loading...</div>
{/if}