export default class ManifestService {
  constructor(dbService, bungieApiService) {
    this._bungieApiService = bungieApiService
    this._dbService = dbService

    this._version = ""
    this._componentsAllowList = [
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

    window.manifestComponents = {}
  }

  collections = {
    CONFIG: "config",
    MANIFEST: "manifest"
  }

  bucketLocationMap = {}

  async init() {
    await this._dbService.init(this.collections)

    let manifest = await this._bungieApiService.fetchManifest()
    this._version = manifest.version

    let dbVersion = await this._dbService.get("config", "manifestVersion")
    console.log("dbVersion:", dbVersion, "version:", this._version)

    if(!dbVersion) {
      await this.initManifest(manifest)
    } else if(dbVersion !== this._version) {
      await this._dbService.clearStore(this.collections.MANIFEST)
      await this.initManifest(manifest)
    } else {
      await this.importManifestFromDb()
      let isImportFromDbSuccessful = this.isImportFromDbSuccessful()
      if(!isImportFromDbSuccessful) {
        console.warn("Manifest cache is corrupted, re-imorting manifest...")
        await this._dbService.clearStore(this.collections.MANIFEST)
        await this.initManifest(manifest)
      }
    }
  }

  async initManifest(manifest) {
    await this._dbService.put(this.collections.CONFIG, "manifestVersion", this._version)
    await this.populateFromInternet(manifest)
    await this.cacheManifest()
  }

  async populateFromInternet(manifest) {
    let componentKeys = Object.keys(manifest.jsonWorldComponentContentPaths.en)

    let fetchManifestComponentPromises = []
    componentKeys.forEach(key => {
      if(this._componentsAllowList.find(el => el === key)) {
        let componentUrl = manifest.jsonWorldComponentContentPaths.en[key]
        fetchManifestComponentPromises.push(this._bungieApiService.fetchManifestComponent(key, componentUrl))
      }
    })
    let rawManifestData = await Promise.all(fetchManifestComponentPromises)

    rawManifestData.forEach(el =>  this.importComponent(el.componentName, el.data))
  }

  async cacheManifest() {
    let promises = []
    Object.keys(window.manifestComponents).forEach(key => {
      promises.push(this._dbService.add(this.collections.MANIFEST, key, window.manifestComponents[key]))
    })
    await Promise.all(promises)
  }

  async importManifestFromDb() {
    let manifestKeys = await this._dbService.getKeys(this.collections.MANIFEST)
    let promises = []
    manifestKeys.forEach(el => promises.push(this.importManifestComponentFromDb(el)))
    await Promise.all(promises)
  }

  isImportFromDbSuccessful() {
    let out = true
    this._componentsAllowList.forEach(el => {
      if(out === false || !window.manifestComponents[el] || Object.keys(window.manifestComponents[el]).length === 0) {
        out = false
        return
      }
    })
    console.log("isImportFromDbSuccessful", out)
    return out
  }

  async importManifestComponentFromDb(manifestKey) {
    let data = await this._dbService.get(this.collections.MANIFEST, manifestKey)
    this.importComponent(manifestKey, data)
  }

  async importComponent(componentName, data) {
    window.manifestComponents[componentName] = data

    if(componentName === "DestinyInventoryBucketDefinition") {
      this.buildBucketLocationMap(data)
    }
  }

  buildBucketLocationMap(data) {
    Object.keys(data).forEach(key => {
      if(data[key].displayProperties && data[key].displayProperties.name) {
        let name = data[key].displayProperties.name

        if(name === "Kinetic Weapons") {
          this.bucketLocationMap[key] = "kinetic"
        }

        if(name === "Energy Weapons") {
          this.bucketLocationMap[key] = "energy"
        }

        if(name === "Power Weapons") {
          this.bucketLocationMap[key] = "power"
        }

        if(name === "Helmet") {
          this.bucketLocationMap[key] = "helmet"
        }

        if(name === "Gauntlets") {
          this.bucketLocationMap[key] = "arms"
        }

        if(name === "Chest Armor") {
          this.bucketLocationMap[key] = "chest"
        }

        if(name === "Leg Armor") {
          this.bucketLocationMap[key] = "legs"
        }

        if(name === "Class Armor") {
          this.bucketLocationMap[key] = "classItem"
        }

        if(name === "Subclass") {
          this.bucketLocationMap[key] = "subclass"
        }
      }
    })
  }

  getItem(componentName, hash) {
    if(!window.manifestComponents[componentName]) {
      console.warn(`manifestService.getItem: ${componentName} is not imported`)
      return false
    }
    return window.manifestComponents[componentName][hash]
  }

  getDataForItemInstance(characterData, itemInstanceId, itemHash) {
    let itemData = {}

    let item = this.getItem("DestinyInventoryItemDefinition", itemHash);
    if(item && item.sockets && item.sockets.socketEntries) {
      let socketDefs = []

      item.sockets.socketEntries.forEach(se => {
        let def = {}
        // $.DestinySocketTypeDefinition.2029743434.socketCategoryHash
        def.type = this.getItem("DestinySocketTypeDefinition", se.socketTypeHash)
        // $.DestinySocketCategoryDefinition.760375309.hash
        if(def.type) {
          def.category = this.getItem("DestinySocketCategoryDefinition", def.type.socketCategoryHash)
        }
        socketDefs.push(def)
      })
      itemData.socketDefs = socketDefs
    }

    itemData.item = item

    if(characterData && characterData.instances && characterData.instances[itemInstanceId] && characterData.instances[itemInstanceId].damageTypeHash) {
      itemData.damageType = this.getItem("DestinyDamageTypeDefinition", characterData.instances[itemInstanceId].damageTypeHash)
    }

    if(characterData && characterData.talentGrids && characterData.talentGrids[itemInstanceId]) {
      itemData.talentGridDef = this.getItem("DestinyTalentGridDefinition", characterData.talentGrids[itemInstanceId].talentGridHash)
    }

    if(characterData && characterData.sockets && characterData.sockets[itemInstanceId]) {
      let sockets = characterData.sockets[itemInstanceId].sockets
      sockets.forEach(s => {
        let def = this.getItem("DestinyInventoryItemDefinition", s.plugHash)
        s.def = def
      })
      itemData.sockets = sockets
    }

    if(characterData && characterData.talentGrids) {
      itemData.talentGrid = characterData.talentGrids[itemInstanceId]
    }

    if(characterData && characterData.stats && characterData.stats[itemInstanceId]) {
      let stats = characterData.stats[itemInstanceId].stats
      Object.keys(stats).forEach(statHash => {
        let statDef = this.getItem("DestinyStatDefinition", statHash)
        stats[statHash].def = statDef
      })
      itemData.stats = stats
    }

    if(characterData && characterData.reusablePlugs && characterData.reusablePlugs[itemInstanceId]) {
      itemData.reusablePlugs = characterData.reusablePlugs[itemInstanceId].plugs
    }

    if(characterData && characterData.instances && characterData.instances[itemInstanceId]) {
      itemData.instanceData = characterData.instances[itemInstanceId]
    }

    if(characterData && characterData.equipment) {
      let item = characterData.equipment.find(el => el.itemInstanceId === itemInstanceId)
      if(item && item.overrideStyleItemHash) {
        // $.DestinyInventoryItemDefinition.4029360764
        let ornamentItem = this.getItem("DestinyInventoryItemDefinition", item.overrideStyleItemHash)
        if(ornamentItem && ornamentItem.displayProperties && ornamentItem.displayProperties.icon) {
          itemData.ornamentIconPath = ornamentItem.displayProperties.icon
        }
      }
    }
    if(item && item.itemTypeDisplayName && item.itemTypeDisplayName.includes("Subclass")) {
      // console.log(JSON.stringify(itemData))
    }
    return itemData
  }
}
