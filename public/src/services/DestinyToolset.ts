import BungieApiService from "./BungieApiService";

export type UserInventory = {
  items: Item[]
}

export type SocketItemMeta = {
  manifestDefinition?: any
}
export class SocketItem {
  _meta?: SocketItemMeta
  iconUrl?: string
  name?: string

  constructor(definition: any) {
    this._meta = {
      manifestDefinition: definition
    }
    this.iconUrl = `https://www.bungie.net${definition.displayProperties.icon}`
    this.name = definition.displayProperties.name
  }

  getDescription(): string {
    if(this._meta?.manifestDefinition?.displayProperties?.description) {
      return this._meta?.manifestDefinition?.displayProperties?.description
    }
    return ""
  }
}

export type ItemMeta = {
  // Item definition from the manifest
  manifestDefinition?: any
  // Raw item from API response
  inventoryItem?: any
  energyTypeDefinition?: any
  // Instanced item from API response
  instance?: any
  perks?: any
  sockets?: any
  damageType?: any
  reusablePlugs?: any
  stats?: any
  source?: string
}

export enum ItemTypeEnum {
  None = 0,
  Currency = 1,
  Armor = 2,
  Weapon = 3,
  Message = 7,
  Engram = 8,
  Consumable = 9,
  ExchangeMaterial = 10,
  MissionReward = 11,
  QuestStep = 12,
  QuestStepComplete = 13,
  Emblem = 14,
  Quest = 15,
  Subclass = 16,
  ClanBanner = 17,
  Aura = 18,
  Mod = 19,
  Dummy = 20,
  Ship = 21,
  Vehicle = 22,
  Emote = 23,
  Ghost = 24,
  Package = 25,
  Bounty = 26,
  Wrapper = 27,
  SeasonalArtifact = 28,
  Finisher = 29
}

export enum ItemSubTypeEnum {
  None = 0,
  Crucible = 1,
  Vanguard = 2,
  Exotic = 5,
  AutoRifle = 6,
  Shotgun = 7,
  Machinegun = 8,
  HandCannon = 9,
  RocketLauncher = 10,
  FusionRifle = 11,
  SniperRifle = 12,
  PulseRifle = 13,
  ScoutRifle = 14,
  Crm = 16,
  Sidearm = 17,
  Sword = 18,
  Mask = 19,
  Shader = 20,
  Ornament = 21,
  FusionRifleLine = 22,
  GrenadeLauncher = 23,
  SubmachineGun = 24,
  TraceRifle = 25,
  HelmetArmor = 26,
  GauntletsArmor = 27,
  ChestArmor = 28,
  LegArmor = 29,
  ClassArmor = 30,
  Bow = 31,
  DummyRepeatableBounty = 32
}

export enum ClassEnum {
  Titan = 0,
  Hunter = 1,
  Warlock = 2,
  Unknown = 3
}

export enum DamageTypeEnum {
  None = 0,
  Kinetic = 1,
  Arc = 2,
  Thermal = 3,
  Void = 4,
  Raid = 5,
  Stasis = 6
}

export enum BucketTypeEnum {
  Kinetic = 1498876634,
  Energy = 2465295065,
  Power = 953998645,
  Helmet = 3448274439,
  Arms = 3551918588,
  Chest = 14239492,
  Legs = 20886954,
  ClassItem = 1585787867,
  Subclass = 3284755031
}

export enum SocketTypeEnum {
  IntrinsicTraits = 3956125808,
  WeaponPerks = 4241085061,
  WeaponMods = 2685412949,
  WeaponCosmetics = 2048875504,
  ArmorMods = 590099826 // TODO: Find the right hash for this
}

export type SocketMeta = {
  plugSet?: any
  typeDefinition?: any
  categoryDefinition?: any
  itemSocketMeta?: any
}

export type Socket = {
  _meta?: SocketMeta
  type?: SocketTypeEnum
  position?: number
  equippedPlug?: SocketItem
  availablePlugs?: SocketItem[]
  potentialPlugs?: SocketItem[]
}

export class Item {
  _meta: ItemMeta
  hash?: number
  iconUrl?: string
  name?: string
  classType?: number
  isExotic?: boolean
  isOrnament?: boolean
  itemType?: ItemTypeEnum
  itemSubType?: ItemSubTypeEnum
  damageType?: DamageTypeEnum
  slot?: BucketTypeEnum
  sockets?: Socket[]
  power?: number
  stats?: Map<string, number>
  quantity?: number
  // TODO: Make this a Character class
  location?: any
  isVaulted?: boolean

  constructor(item: any, itemComponents: any, source?: string) {
    this._meta = {}
    if(source) {
      this._meta.source = source
      if(source === "profilePlugs") {
        this.isOrnament = true
      }
      if(source === "profileInventory") {
        this.isVaulted = true
      }
    }
    this._meta.inventoryItem = item
    if(itemComponents) {
      if(itemComponents.instances.data[item.itemInstanceId]) {
        this._meta.instance = itemComponents.instances.data[item.itemInstanceId]
      }
      if(itemComponents.perks.data[item.itemInstanceId]) {
        this._meta.perks = itemComponents.perks.data[item.itemInstanceId].perks
      }
      if(itemComponents.sockets.data[item.itemInstanceId]) {
        this._meta.sockets = itemComponents.sockets.data[item.itemInstanceId].sockets
      }
      if(itemComponents.reusablePlugs.data[item.itemInstanceId]) {
        this._meta.reusablePlugs = itemComponents.reusablePlugs.data[item.itemInstanceId].plugs
      }
      if(itemComponents.stats.data[item.itemInstanceId]) {
        this._meta.stats = itemComponents.stats.data[item.itemInstanceId].stats
      }
    }
  }

  populate(manifestService: any, plugSets: any) {
    // Basic info
    let itemHash = 0
    if(this._meta?.inventoryItem.itemHash) {
      itemHash = this._meta?.inventoryItem.itemHash
    }

    if(this._meta.inventoryItem.plugItemHash) {
      itemHash = this._meta.inventoryItem.plugItemHash
    }
    this.hash = itemHash
    let itemDef = manifestService.getItem("DestinyInventoryItemDefinition", itemHash);
    if(itemDef) {
      this._meta.manifestDefinition = itemDef
    }

    if(itemDef && itemDef.inventory && itemDef.inventory.tierType === 6) {
      this.isExotic = true
    }

    if(itemDef && itemDef.displayProperties && itemDef.displayProperties.icon) {
      this.iconUrl = `https://www.bungie.net${itemDef.displayProperties.icon}`
      this.name = itemDef.displayProperties.name
      this.itemType = itemDef.itemType
      this.itemSubType = itemDef.itemSubType
      this.classType = itemDef.classType
    }

    if(itemDef && itemDef.inventory && itemDef.inventory.bucketTypeHash) {
      this.slot = itemDef.inventory.bucketTypeHash
    }

    if(this._meta.instance) {
      let damageTypeDefinition = manifestService.getItem("DestinyDamageTypeDefinition", this._meta.instance.damageTypeHash)
      if(damageTypeDefinition) {
        this._meta.damageType = damageTypeDefinition
        // TODO: Populate an enum
      }

      if(this._meta.instance.energy) {
        let energyTypeDefinition = manifestService.getItem("DestinyEnergyTypeDefinition", this._meta.instance.energy.energyTypeHash)
        if(energyTypeDefinition) {
          this._meta.energyTypeDefinition = energyTypeDefinition
        }
      }
    }

    // Stats
    if(this._meta.stats) {
      // TODO: Turn this into an object and store the stat def with the obj
      this.stats = new Map<string, number>()
      Object.keys(this._meta.stats).forEach((key: string) => {
        let statDefinition = manifestService.getItem("DestinyStatDefinition", key)
        if(statDefinition) {
          this.stats?.set(statDefinition.displayProperties.name, this._meta.stats[key])
        }
      })
    }

    // Perks & Mods
    if(itemDef && itemDef.sockets && itemDef.sockets.socketEntries) {
      // TODO: Remove the anys
      itemDef.sockets.socketEntries.forEach((se: any, idx: number) => {
        let socket: Socket = {
          _meta: {},
          position: idx
        }
        // socket.type = se.socketTypeHash
        let type = manifestService.getItem("DestinySocketTypeDefinition", se.socketTypeHash)
        if(type && socket && socket._meta) {
          socket._meta.typeDefinition = type
          let category = manifestService.getItem("DestinySocketCategoryDefinition", type.socketCategoryHash)
          if(category) {
            socket._meta.categoryDefinition = category
          }
        }

        if(this._meta.sockets && this._meta.sockets[idx] && socket && socket._meta) {
          socket._meta.itemSocketMeta = this._meta.sockets[idx]
          let plugDef = manifestService.getItem("DestinyInventoryItemDefinition", this._meta.sockets[idx].plugHash)
          if(plugDef) {
            socket.equippedPlug = new SocketItem(plugDef)

            if(this._meta.reusablePlugs && this._meta.reusablePlugs[idx]) {
              let availablePlugs: SocketItem[] = []
              this._meta.reusablePlugs[idx].forEach((plug: any) => {
                let def = manifestService.getItem("DestinyInventoryItemDefinition", plug.plugItemHash)
                let socketItem = new SocketItem(def)
                availablePlugs.push(socketItem)
              })
              socket.availablePlugs = availablePlugs
            }
          }
        }

        // This might show all available plugs for the item...
        if(plugSets && se.randomizedPlugSetHash) {
          // console.log(se.randomizedPlugSetHash)
          let plugSet = plugSets.plugs[se.randomizedPlugSetHash]
          if(plugSet && socket && socket._meta) {
            socket._meta.plugSet = plugSet
            let potentialPlugs: SocketItem[] = []
            plugSet.forEach((plug: any) => {
              let def = manifestService.getItem("DestinyInventoryItemDefinition", plug.plugItemHash)
              let socketItem = new SocketItem(def)
              potentialPlugs.push(socketItem)
            })
            socket.potentialPlugs = potentialPlugs
          }
        }

        if(this.sockets === undefined) {
          this.sockets = []
        }
        this.sockets.push(socket)
      })
    }
  }

  getIntrinsicTraits(): (SocketItem[] | null) {
    if(this.itemType === ItemTypeEnum.Weapon) {
      let items: Array<SocketItem> = []
      this.sockets?.forEach(s => {
        if(s._meta?.categoryDefinition?.hash === SocketTypeEnum.IntrinsicTraits &&
          s._meta?.itemSocketMeta?.isVisible &&
          s.equippedPlug) {
          items.push(s.equippedPlug)
        }
      })
      return items
    } else {
      return null
    }
  }

  getPerkSockets(): (Socket[] | null) {
    if(this.itemType === ItemTypeEnum.Weapon && this.sockets) {
      return this.sockets?.filter((s: Socket) => s._meta?.categoryDefinition?.hash === SocketTypeEnum.WeaponPerks)
    }
    // if(this.itemType === ItemTypeEnum.Armor && this.sockets) {
    //   return this.sockets?.filter((s: Socket) => s._meta?.categoryDefinition?.hash === SocketTypeEnum.ArmorPerks)
    // }
    return null
  }

  getEquippedPerks(): (SocketItem[] | null) {
    if(this.itemType === ItemTypeEnum.Weapon) {
      let items: Array<SocketItem> = []
      this.sockets?.forEach(s => {
        if(s._meta?.categoryDefinition?.hash === SocketTypeEnum.WeaponPerks &&
          s._meta?.itemSocketMeta?.isVisible &&
          s.equippedPlug) {
          items.push(s.equippedPlug)
        }
      })
      return items
    } else {
      return null
    }
  }

  getModSockets(): (Socket[] | null) {
    if(this.itemType === ItemTypeEnum.Weapon) {
      if(this.sockets) {
        return this.sockets.filter((s: Socket) => s._meta?.categoryDefinition && s._meta?.categoryDefinition.hash === SocketTypeEnum.WeaponMods)
      }
    }
    if(this.itemType === ItemTypeEnum.Armor) {
      if(this.sockets) {
        return this.sockets.filter((s: Socket) => s._meta?.categoryDefinition && s._meta?.categoryDefinition.hash === SocketTypeEnum.ArmorMods)
      }
    }
    return null
  }

  getEquippedMods(): (SocketItem[] | null) {
    if(this.itemType === ItemTypeEnum.Weapon) {
      let items: Array<SocketItem> = []
      this.sockets?.forEach(s => {
        if(s._meta?.categoryDefinition?.hash === SocketTypeEnum.WeaponMods &&
          s._meta?.itemSocketMeta?.isVisible &&
          s.equippedPlug) {
          items.push(s.equippedPlug)
        }
      })
      return items
    }
    if(this.itemType === ItemTypeEnum.Armor) {
      let items: Array<SocketItem> = []
      this.sockets?.forEach(s => {
        if(s._meta?.categoryDefinition?.hash === SocketTypeEnum.ArmorMods &&
          s._meta?.itemSocketMeta?.isVisible &&
          s.equippedPlug) {
          items.push(s.equippedPlug)
        }
      })
      return items
    }
    return null
  }

  getPower(): (number | null) {
    if(this._meta.instance && this._meta.instance.primaryStat) {
      return this._meta.instance.primaryStat.value
    }
    return null
  }

  getAffinityIcon() {
    if(this._meta.damageType && this._meta.damageType.displayProperties && this._meta.damageType.displayProperties.hasIcon) {
      return `https://www.bungie.net${this._meta.damageType.displayProperties.icon}`
    }
    if(this._meta.energyTypeDefinition && this._meta.energyTypeDefinition.displayProperties && this._meta.energyTypeDefinition.displayProperties.hasIcon) {
      return `https://www.bungie.net${this._meta.energyTypeDefinition.displayProperties.icon}`
    }
    return null
  }

  getItemTier() {

  }

  getStats() {
    let power = this._meta.instance.primaryStat.value
  }
}

export class DestinyInventoryService {
  _bungieApiService: BungieApiService
  _manifestService: any
  _inventory?: UserInventory

  // TODO: Replace any on manifest service
  constructor(bungieApiService: BungieApiService, manifestService: any) {
    this._bungieApiService = bungieApiService
    this._manifestService = manifestService
    this._inventory = {
      items: []
    }
  }

  loadInventory(inventoryResponse: any) {
    console.log("loadInventory", inventoryResponse)
    const {
      profileInventory,
      itemComponents,
      profilePlugSets,
      characterInventories,
      characterPlugSets,
      characterCurrencyLookups,
      characters
    } = inventoryResponse

    profileInventory.data.items.forEach((el: any) => {
      let item = new Item(el, itemComponents, "profileInventory")
      item.populate(this._manifestService, profilePlugSets.data)
      this._inventory?.items.push(item)
    })

    Object.keys(characterInventories.data).forEach((k: string) => {
      characterInventories.data[k].items.forEach((el: any) => {
        let item = new Item(el, itemComponents, "characterInventories")
        item.populate(this._manifestService, characterPlugSets.data[k])
        if(characters && characters.data && characters.data[k]) {
          item.location = characters.data[k]
        }
        this._inventory?.items.push(item)
      })
    })

    let profilePlugs = profilePlugSets.data.plugs
    Object.keys(profilePlugs).forEach((k: string) => {
      profilePlugs[k].forEach((plug: any) => {
        let item = new Item(plug, itemComponents, "profilePlugs")
        item.populate(this._manifestService, null)
        this._inventory?.items.push(item)
      })
    })

    Object.keys(characterCurrencyLookups.data).forEach((k: string) => {
      Object.keys(characterCurrencyLookups.data[k].itemQuantities).forEach((hash: string) => {
        // Fix for subclass issue, not sure why subclasses sometimes show in inventory and some in currencies...
        let itemHash = Number(hash)
        if(!this._inventory?.items.find((i: Item) => i.hash == itemHash)) {
          let item = new Item({
            itemHash: itemHash
          }, null, "characterCurrencyLookups")
          item.populate(this._manifestService, null)
          item.quantity = characterCurrencyLookups.data[k].itemQuantities[hash]
          if(characters && characters.data && characters.data[k]) {
            item.location = characters.data[k]
          }
          this._inventory?.items.push(item)
        }
      })
    })

    console.log("populated inventory", this._inventory)
  }

  getAvailableSubclasses(classType: ClassEnum): Array<Item> {
    return this.lookupItems(undefined, undefined, classType, BucketTypeEnum.Subclass)
  }

  // Returns a list of items based on the filters passed in
  lookupItems(type?: ItemTypeEnum, subType?: ItemSubTypeEnum, classType?: ClassEnum, slot?: BucketTypeEnum): Array<Item> {
    if(!this._inventory) {
      throw new Error("Inventory not yet loaded")
    }
    if(type === undefined && subType === undefined && classType == undefined) {
      throw new Error("One or more of type, subType, or classType must be defined")
    }

    let returnItems: Array<Item> = []
    if(type !== null && type != undefined) {
      returnItems = this._inventory.items.filter((i: Item) => i.itemType === type && !i.isOrnament)
    }

    if(subType !== null && subType !== undefined) {
      if(returnItems.length === 0) {
        returnItems = this._inventory.items.filter((i: Item) => i.itemSubType === subType && !i.isOrnament)
      } else {
        returnItems = returnItems.filter((i: Item) => i.itemSubType === subType && !i.isOrnament)
      }
    }

    if(classType !== null && classType !== undefined) {
      if(returnItems.length === 0) {
        returnItems = this._inventory.items.filter((i: Item) => i.classType === classType && !i.isOrnament)
      } else {
        returnItems = returnItems.filter((i: Item) => i.classType === classType && !i.isOrnament)
      }
    }

    if(slot !== null && slot != undefined) {
      if(returnItems.length === 0) {
        returnItems = this._inventory.items.filter((i: Item) => i.slot === slot && !i.isOrnament)
      } else {
        returnItems = returnItems.filter((i: Item) => i.slot === slot && !i.isOrnament)
      }
    }
    return returnItems
  }

  getModsForItem(item: Item): (Map<number, Item[]> | null) {
    if(!item.sockets) {
      return null
    }

    let whitelistPlugHashes: any= {}

    item.sockets.forEach((socket: Socket) => {
      if(socket._meta?.categoryDefinition &&
        socket.position &&
        (socket._meta?.categoryDefinition?.hash === SocketTypeEnum.WeaponMods ||
        socket._meta?.categoryDefinition.hash === SocketTypeEnum.ArmorMods)) {
          let hashes = socket._meta.typeDefinition.plugWhitelist.map((pwl: any) => pwl.categoryHash)
          whitelistPlugHashes[socket.position] = hashes
        }
    })

    let socketPlugMap: Map<number, Item[]> = new Map<number, Item[]>()

    Object.keys(whitelistPlugHashes).forEach((key: string) => {
      let items: Item[] = []
      whitelistPlugHashes[key].forEach((hash: number) => {
        this._inventory?.items.forEach((i: Item) => {
          if(i._meta.manifestDefinition.plug && i._meta?.manifestDefinition?.plug?.plugCategoryHash === hash) {
            if(!items.find((ci: Item) => ci.hash === i.hash)) {
              items.push(i)
            }
          }
        })
      })

      if(items) {
        socketPlugMap.set(Number(key), items)
        // socketPlugMap[key] = items
      }
    })

    return socketPlugMap
  }
}

// TODO: Move this into BungieApiService
type InventoryResponse = {

}

type InstancedItem = {
  bucketHash?: number
  itemHash?: number
  itemInstanceId?: string
  location?: number
}