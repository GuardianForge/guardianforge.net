import { Socket } from "./Socket"
import { SocketItem } from "./SocketItem"
import { ItemTypeEnum, ItemSubTypeEnum, DamageTypeEnum, BucketTypeEnum, SocketTypeEnum, EnergyTypeEnum, WeaponMasterworkType } from "./Enums"

export type ItemTierData = {
  icon?: string
  damageType?: DamageTypeEnum
  tier?: number
}

export type ItemSourceData = {
  sourceName?: string
  talentGrids?: any
  plugSets?: any
}

export type ItemMeta = {
  // Item definition from the manifest
  manifestDefinition?: any
  // Raw item from API response
  inventoryItem?: any
  talentGridDefinition?: any
  energyTypeDefinition?: any
  // Instanced item from API response
  instance?: any
  perks?: any
  sockets?: any
  damageType?: any
  reusablePlugs?: any
  stats?: any
  source?: ItemSourceData
  talentGrid?: any
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
  energyType?: EnergyTypeEnum
  slot?: BucketTypeEnum
  sockets?: Socket[]
  power?: number
  stats?: Map<string, number>
  quantity?: number
  // TODO: Make this a Character class
  location?: any
  isVaulted?: boolean
  cost?: number

  constructor(item: any, itemComponents: any, source?: string, plugSets?: any, talentGrids?: any) {
    this._meta = {}
    if(source || plugSets || talentGrids) {
      this._meta.source = {
        sourceName: source,
        plugSets,
        talentGrids
      }

      if(source) {
        if(source === "profilePlugs") {
          this.isOrnament = true
        }
        if(source === "profileInventory") {
          this.isVaulted = true
        }
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

  /**
   * Populates the item with data from the manifest and other relevant data sets
   * @param manifestService An instance of the ManifestService
   */
  populate(manifestService: any) {
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

    if(itemDef && itemDef.talentGrid && itemDef.talentGrid.talentGridHash) {
      this._meta.talentGridDefinition = manifestService.getItem("DestinyTalentGridDefinition", itemDef.talentGrid.talentGridHash)
    }

    // Damage type
    if(this._meta.instance) {
      let damageTypeDefinition = manifestService.getItem("DestinyDamageTypeDefinition", this._meta.instance.damageTypeHash)
      if(damageTypeDefinition) {
        this.damageType = this._meta.instance.damageType
        this._meta.damageType = damageTypeDefinition
        // TODO: Populate an enum
      }

      if(this._meta.instance.energy) {
        let energyTypeDefinition = manifestService.getItem("DestinyEnergyTypeDefinition", this._meta.instance.energy.energyTypeHash)
        if(energyTypeDefinition) {
          this.energyType = this._meta.instance.energy.energyType
          this._meta.energyTypeDefinition = energyTypeDefinition
        }
      }
    }

    if(itemDef.plug && itemDef.plug.energyCost) {
      this.cost = itemDef.plug.energyCost.energyCost

      if(this.energyType === undefined) {
        let energyTypeDefinition = manifestService.getItem("DestinyEnergyTypeDefinition", itemDef.plug.energyCost.energyTypeHash)
        if(energyTypeDefinition) {
          this.energyType = itemDef.plug.energyCost.energyType
          this._meta.energyTypeDefinition = energyTypeDefinition
        }
      }
    }

    // Damage type on V2 subclasses
    if(this.damageType == undefined && itemDef.talentGrid && itemDef.talentGrid.hudDamageType) {
      this.damageType = itemDef.talentGrid.hudDamageType
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
            socket.equippedPlug.socketIndex = idx

            if(plugDef.plug && plugDef.plug.plugCategoryIdentifier && plugDef.plug.plugCategoryIdentifier.includes("masterworks")) {
              socket.isItemTierSocket = true
            }

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
        if(this._meta && this._meta.source && this._meta.source.plugSets && se.randomizedPlugSetHash) {
          // console.log(se.randomizedPlugSetHash)
          let plugSet = this._meta.source.plugSets.plugs[se.randomizedPlugSetHash]
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

    // Talent Grids
    if(this._meta && this._meta.source && this._meta.source.talentGrids && this._meta.inventoryItem.itemInstanceId && this._meta.source.talentGrids[this._meta.inventoryItem.itemInstanceId]) {
      this._meta.talentGrid = this._meta.source.talentGrids[this._meta.inventoryItem.itemInstanceId]
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
    } else if(this.itemType === ItemTypeEnum.Armor) {
      let items: Array<SocketItem> = []
      this.sockets?.forEach(s => {
        if(s._meta?.categoryDefinition?.hash === SocketTypeEnum.ArmorPerks &&
          s._meta?.itemSocketMeta?.isVisible &&
          s.equippedPlug) {
          items.push(s.equippedPlug)
        }
      })
      return items
    }
    return null
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
      this.sockets?.forEach((s: Socket, idx: number) => {
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

  getAvailableModsForSocket(socket: Socket) {
    // TODO: Consider the energy type
  }

  getModEnergyConsumption(): (number | null) {
    if(this.sockets) {
      let consumption = 0
      this.sockets.forEach((s: Socket) => {
        if(s.equippedPlug && s.equippedPlug.cost) {
          consumption += s.equippedPlug.cost
        }
      })
      return consumption
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

  getAffinityIcon(): (string | null) {
    if(this._meta.damageType && this._meta.damageType.displayProperties && this._meta.damageType.displayProperties.hasIcon) {
      return `https://www.bungie.net${this._meta.damageType.displayProperties.icon}`
    }
    if(this._meta.energyTypeDefinition && this._meta.energyTypeDefinition.displayProperties && this._meta.energyTypeDefinition.displayProperties.hasIcon) {
      return `https://www.bungie.net${this._meta.energyTypeDefinition.displayProperties.icon}`
    }
    return null
  }

  getItemTier() {
    let tierInfo: ItemTierData = {}
    if(this._meta && this._meta.instance && this._meta.instance.energy && this._meta.instance.energy.energyCapacity !== undefined) {
      tierInfo.tier = this._meta.instance.energy.energyCapacity
      tierInfo.damageType = this._meta.instance.energy.energyType
    }
    if(this._meta.damageType && this._meta.damageType.displayProperties && this._meta.damageType.displayProperties.hasIcon) {
      tierInfo.icon = `https://www.bungie.net${this._meta.damageType.displayProperties.icon}`
    } else if(this._meta.energyTypeDefinition && this._meta.energyTypeDefinition.displayProperties && this._meta.energyTypeDefinition.displayProperties.hasIcon) {
      tierInfo.icon = `https://www.bungie.net${this._meta.energyTypeDefinition.displayProperties.icon}`
    }
    return tierInfo
  }

  getStats() {
    let power = this._meta.instance.primaryStat.value
  }

  private isSubclass(): boolean {
    if(this.itemType === ItemTypeEnum.Subclass) {
      return true
    }
    if(this.slot === BucketTypeEnum.Subclass) {
      return true
    }
    return false
  }

  getSubclassVersion(): number {
    if(!this.isSubclass()) {
      throw new Error("Attempted to use subclass-specific method on non-subclass item.")
    }
    if(this._meta && this._meta.sockets) {
      return 3
    }
    return 2
  }

  // Helper methods for v2 subclasses
  getEquippedClassSpecialty() {
    if(!this.isSubclass()) {
      throw new Error("Attempted to use subclass-specific method on non-subclass item.")
    }
    return this.getEquppedSubclassNodeByIdentifier("ClassSpecialties")
  }

  getEquippedGrenade() {
    if(!this.isSubclass()) {
      throw new Error("Attempted to use subclass-specific method on non-subclass item.")
    }
    return this.getEquppedSubclassNodeByIdentifier("Grenades")
  }

  getEquippedMovementMode() {
    if(!this.isSubclass()) {
      throw new Error("Attempted to use subclass-specific method on non-subclass item.")
    }
    return this.getEquppedSubclassNodeByIdentifier("MovementModes")
  }

  getEquippedSuperTree() {
    if(!this.isSubclass()) {
      throw new Error("Attempted to use subclass-specific method on non-subclass item.")
    }
    let superTree = {
      name: "",
      pos: 0,
      perks: []
    }

    let trees = [
      "FirstPath",
      "SecondPath",
      "ThirdPath"
    ]

    let categories = this._meta.talentGridDefinition.nodeCategories.filter((n: any) => trees.includes(n.identifier))
    categories.forEach((c: any) => {
      c.nodeHashes.forEach((nodeIndex: number) => {
        if(this._meta.talentGrid.nodes[nodeIndex].isActivated) {
          if(c.identifier === "FirstPath") {
            superTree.pos = 1
          }
          if(c.identifier === "SecondPath") {
            superTree.pos = 2
          }
          if(c.identifier === "ThirdPath") {
            superTree.pos = 3
          }
          superTree.name = c.displayProperties.name
          // @ts-ignore
          superTree.perks.push(this._meta.talentGridDefinition.nodes[nodeIndex].steps[0].displayProperties)
        }
      })
    })

    return superTree
  }

  private getEquppedSubclassNodeByIdentifier(identifier: string) {
    if(!this.isSubclass()) {
      throw new Error("Attempted to use subclass-specific method on non-subclass item.")
    }
    let nodeCategory = this._meta.talentGridDefinition.nodeCategories.find((n: any) => n.identifier === identifier)
    let equipped;
    nodeCategory.nodeHashes.forEach((nodeIndex: number) => {
      if(this._meta.talentGrid.nodes[nodeIndex].isActivated) {
        equipped = this._meta.talentGridDefinition.nodes[nodeIndex].steps[0].displayProperties
      }
    })
    return equipped
  }


  getAvailableClassSpecialties() {
    if(!this.isSubclass()) {
      throw new Error("Attempted to use subclass-specific method on non-subclass item.")
    }
    return this.getAvailableSucblassNodesByIdentifier("ClassSpecialties")
  }

  getAvailableGrenades() {
    if(!this.isSubclass()) {
      throw new Error("Attempted to use subclass-specific method on non-subclass item.")
    }
    return this.getAvailableSucblassNodesByIdentifier("Grenades")
  }

  getAvailableMovementModes() {
    if(!this.isSubclass()) {
      throw new Error("Attempted to use subclass-specific method on non-subclass item.")
    }
    return this.getAvailableSucblassNodesByIdentifier("MovementModes")
  }

  getAvailableSuperTrees() {
    if(!this.isSubclass()) {
      throw new Error("Attempted to use subclass-specific method on non-subclass item.")
    }
    let superTrees = new Array<any>();

    let trees = [
      "FirstPath",
      "SecondPath",
      "ThirdPath"
    ]

    let categories = this._meta.talentGridDefinition.nodeCategories.filter((n: any) => trees.includes(n.identifier))
    categories.forEach((c: any) => {
      c.nodeHashes.forEach((nodeIndex: number) => {
        let tree = 0
        if(c.identifier === "FirstPath") {
          tree = 1
        }
        if(c.identifier === "SecondPath") {
          tree = 2
        }
        if(c.identifier === "ThirdPath") {
          tree = 3
        }
        if(!superTrees[tree]) {
          superTrees[tree] = {
            name: c.displayProperties.name,
            pos: tree,
            perks: []
          }
        }
        // @ts-ignore
        superTrees[tree].perks.push(this._meta.talentGridDefinition.nodes[nodeIndex].steps[0].displayProperties)
      })
    })

    return superTrees
  }

  private getAvailableSucblassNodesByIdentifier(identifier: string) {
    if(!this.isSubclass()) {
      throw new Error("Attempted to use subclass-specific method on non-subclass item.")
    }
    let nodeCategory = this._meta.talentGridDefinition.nodeCategories.find((n: any) => n.identifier === identifier)
    // TODO: Buld a model for this
    let nodes = new Array<any>();
    nodeCategory.nodeHashes.forEach((nodeIndex: number) => {
      nodes.push(this._meta.talentGridDefinition.nodes[nodeIndex].steps[0].displayProperties)
    })
    return nodes;
  }
}