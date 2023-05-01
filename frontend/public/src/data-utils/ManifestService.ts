import { BungieApiService } from "./BungieApiService"
import { IManifestCache } from "./interfaces/IManifestCache"

export class ManifestService {
  bungieApiService: BungieApiService
  cache?: IManifestCache
  manifestVersion: string
  components: string[]
  manifestData: Map<string, any>

  collections = {
    CONFIG: "config",
    MANIFEST: "manifest"
  }

  constructor(bungieApiService: BungieApiService, cache?: IManifestCache, components?: string[]) {
    this.bungieApiService = bungieApiService
    this.cache = cache

    this.manifestVersion = ""
    if(components !== undefined) {
      this.components = components
    } else {
      this.components = []
    }

    this.manifestData = new Map<string, any>()
  }

  async init() {
    if(this.cache !== undefined) {
      await this.cache.init([this.collections.CONFIG, this.collections.MANIFEST])
    }

    let manifest = await this.bungieApiService.fetchManifest()
    this.manifestVersion = manifest.version

    if(this.cache !== undefined) {
      let dbVersion = await this.cache.get("config", "manifestVersion")
      if(!dbVersion || dbVersion === undefined) {
        console.log("Downloading manifest manifest, version:", manifest.version)
        await this.initManifest(manifest)
      } else if(dbVersion !== this.manifestVersion) {
        console.log(`Updating manifest from version ${dbVersion} to ${manifest.version}`)
        await this.cache.clearStore(this.collections.MANIFEST)
        await this.initManifest(manifest)
      } else {
        console.log("Loading cached manifest, version:", dbVersion)
        await this.importManifestFromDb()
        let isImportFromDbSuccessful = this.isImportFromDbSuccessful()
        if(!isImportFromDbSuccessful) {
          console.warn("Manifest cache is corrupted, re-imorting manifest...")
          await this.cache.clearStore(this.collections.MANIFEST)
          await this.initManifest(manifest)
        }
      }
    } else {
      console.log("Loading manifest without caching.")
      await this.initManifest(manifest)
    }
  }

  // TODO: Define manifest response
  async initManifest(manifest: any) {
    if(this.cache !== undefined) {
      await this.cache.put(this.collections.CONFIG, "manifestVersion", this.manifestVersion)
    }
    await this.populateFromInternet(manifest)
    await this.cacheManifest()
  }

  async populateFromInternet(manifest: any) {
    let componentKeys = Object.keys(manifest.jsonWorldComponentContentPaths.en)

    let fetchManifestComponentPromises: Promise<any>[] = []
    if(this.components.length > 0) {
      componentKeys.forEach(key => {
        if(this.components.find(el => el === key)) {
          let componentUrl = manifest.jsonWorldComponentContentPaths.en[key]
          fetchManifestComponentPromises.push(this.bungieApiService.fetchManifestComponent(key, componentUrl))
        }
      })
    } else {
      componentKeys.forEach(key => {
        let componentUrl = manifest.jsonWorldComponentContentPaths.en[key]
        fetchManifestComponentPromises.push(this.bungieApiService.fetchManifestComponent(key, componentUrl))
      })
    }
    let rawManifestData = await Promise.all(fetchManifestComponentPromises)

    rawManifestData.forEach(el => this.manifestData.set(el.componentName, el.data))
  }

  async cacheManifest() {
    if(this.cache !== undefined) {
      try {
        let promises: Promise<any>[] = []
        // TODO: Figure this out, shouldnt be any
        let keys: any = this.manifestData.keys()
        for(let k of keys) {
          promises.push(this.cache.add(this.collections.MANIFEST, k, this.manifestData.get(k)))
        }
        await Promise.all(promises)
      } catch (err) {
        console.error("ManifestService.cacheManfiest: adding to cache", err)
        throw err
      }
    }
  }

  async importManifestFromDb() {
    if(this.cache !== undefined) {
      let manifestKeys = await this.cache.getKeys(this.collections.MANIFEST)
      if(manifestKeys !== null) {
        let promises: Promise<any>[] = []
        manifestKeys.forEach((el: string) => promises.push(this.importManifestComponentFromDb(el)))
        await Promise.all(promises)
      }
    }
  }

  isImportFromDbSuccessful() {
    let out = true
    this.components.forEach(el => {
      if(out === false || !this.manifestData.get(el) || Object.keys(this.manifestData.get(el)).length === 0) {
        out = false
        return
      }
    })
    return out
  }

  async importManifestComponentFromDb(manifestKey: string) {
    if(this.cache) {
      let data = await this.cache.get(this.collections.MANIFEST, manifestKey)
      this.manifestData.set(manifestKey, data)
    }
  }

  getItem(componentName: string, hash: string) {
    if(!this.manifestData.get(componentName)) {
      console.warn(`manifestService.getItem: ${componentName} is not imported`)
      return false
    }
    return this.manifestData.get(componentName)[hash]
  }
}
