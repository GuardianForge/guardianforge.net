import { Loadout, LoadoutItem } from "@destinyitemmanager/dim-api-types"
import { BungieApiService, Enums, Item, ManifestService, Socket, SocketItem } from "../data-utils/Main"
import { DamageTypeEnum, ItemTypeEnum } from "../data-utils/models/Enums"
// @ts-ignore
import buildUtils from "../utils/buildUtils"
import BuildSummary from "./BuildSummary"

class Build {
  primaryActivity?: string
  secondaryActivity?: string
  inputStyle?: string
  notes?: string
  stats?: BuildStatCollection
  items?: BuildItemCollection
  name?: string
  selectedUser?: BuildUser
  createdBy?: string
  videoLink?: string
  isPrivate?: boolean
  highlights?: Array<string>
  class?: number


  toDIMLink(): string {
    let url = `https://app.destinyitemmanager.com/loadouts?loadout=`
    const loadout: Loadout = {
      id: "guardianforge", // DIM will replace this with unique ID upon receiving
      name: this.name ?? "GuardianForge Loadout",
      classType: this.class,
      clearSpace: false,
      equipped: [],
      unequipped: [],
      parameters: {
        mods: [],
        modsByBucket: {}
      }
    }
    const toLoadoutItem = (item: BuildItem): LoadoutItem | undefined =>
      item?.itemHash !== undefined ? ({hash: item.itemHash, id: item.itemInstanceId}) : undefined
    if (this.items) {
      // Armor mods are in a flat list for DIM to assign best
      const armor = [
        this.items.helmet,
        this.items.arms,
        this.items.chest,
        this.items.legs,
        this.items.classItem
      ]
      armor.forEach(item => {
        if (item) {
          const mappedItem = toLoadoutItem(item)
          if (mappedItem) {
            loadout.equipped.push(mappedItem)
          }
          item.mods?.forEach(m => {
            if(m.plugHash && m.name !== "Empty Mod Socket") {
              loadout.parameters!.mods!.push(Number(m.plugHash))
            }
          })
        }
      })

      // Weapon mods could potentially be part of the weapon item `socketOverrides` in the future,
      // but DIM doesn't support this right now.
      const weapons = [
        this.items.kinetic,
        this.items.energy,
        this.items.power
      ]
      weapons.forEach(item => {
        if (item) {
          const mappedItem = toLoadoutItem(item)
          if (mappedItem) {
            loadout.equipped.push(mappedItem)
          }
        }
      })

      // Subclass configuration is part of the `socketOverrides`
      if (this.items.subclass) {
        const subclassItem = toLoadoutItem(this.items.subclass)
        if (subclassItem) {
          subclassItem.socketOverrides = {}
          const plugs = [
            this.items.subclass.abilities,
            this.items.subclass.aspects,
            this.items.subclass.fragments
          ].flatMap(plugs => plugs ?? [])
          plugs.forEach(p => {
            if (
              p.socketIndex !== undefined &&
              p.plugHash !== undefined &&
              p.name !== "Empty Aspect Socket" &&
              p.name !== "Empty Fragment Socket"
            ) {
              subclassItem.socketOverrides![p.socketIndex] = Number(p.plugHash)
            }
          })
          loadout.equipped.push(subclassItem)
        }
      }
    }

    url += encodeURIComponent(JSON.stringify(loadout))
    return url
  }

  toBuildSummary(buildId: string): BuildSummary {
    let summary: BuildSummary = {
      id: buildId,
      name: this.name ? this.name : `Build ${buildId}`,
      highlights: [],
      primaryIconSet: "",
      upvotes: 0,
      username: "",
      publishedOn: Date.now() / 1000,
      isPrivate: this.isPrivate
    }

    if(this.selectedUser && summary.userId) {
      summary.userId = this.selectedUser.bungieNetUserId
    }

    if(this.selectedUser && this.selectedUser.displayName) {
      summary.username = this.selectedUser.displayName
    }

    if(this.highlights && this.highlights.length > 0) {
      // parse highlights
      this.highlights.forEach(h => {
        if(summary.highlights.length < 3) {
          let icon = this.parseHighlightIcon(h)
          summary.highlights.push(icon)
        }
      })
    } else {
      if(this.items && this.items.kinetic && this.items.kinetic.iconUrl) {
        summary.highlights.push(this.items.kinetic.iconUrl)
      }
      if(this.items && this.items.energy && this.items.energy.iconUrl) {
        summary.highlights.push(this.items.energy.iconUrl)
      }
      if(this.items && this.items.power && this.items.power.iconUrl) {
        summary.highlights.push(this.items.power.iconUrl)
      }
    }

    if(this.items && this.items.subclass) {
      if(this.items.subclass.isLightSubclass && this.items.subclass.superConfig) {
        let { damageType, tree } = this.items.subclass.superConfig
        summary.primaryIconSet = `${this.class}-${damageType}-${tree}`
      } else {
        if(this.items.subclass.damageType) {
          summary.primaryIconSet = `${this.class}-${this.items.subclass.damageType}`
        } else {
          summary.primaryIconSet = `${this.class}-6`
        }
      }
    }
    return summary
  }

  private parseHighlightIcon(highlight: string): string {
    let split = highlight.split("-")
    let out
    if(split[0] === "stat") {
      // @ts-ignore
      out = this.stats[split[1]].icon
    }

    if(split[0] === "ability") {
      let socketIndex = split[2]

      // @ts-ignore
      this.items.subclass.abilities.forEach((el: any) => {
        if(el.socketIndex === socketIndex) {
          out = el.iconUrl
        }
      })
    }

    if(split[0] === "aspect") {
      let socketIndex = split[2]

      // @ts-ignore
      this.items.subclass.aspects.forEach((el: any) => {
        if(el.socketIndex === socketIndex) {
          out = el.iconUrl
        }
      })
    }

    if(split[0] === "fragment") {
      let socketIndex = split[2]

      // @ts-ignore
      this.items.subclass.fragments.forEach((el: any)=> {
        if(el.socketIndex === socketIndex) {
          out = el.iconUrl
        }
      })
    }

    if(split[0] === "perk") {
      let socketIndex = split[2]
      let item = this.getItemForInstanceId(split[1])

      if(item && item.perks) {
        item.perks.forEach((el: any) => {
          if(el.socketIndex === socketIndex) {
            out = el.iconUrl
          }
        })
      }
    }

    if(split[0] === "mod") {
      let socketIndex = split[2]
      let item = this.getItemForInstanceId(split[1])

      if(item && item.mods) {
        item.mods.forEach((el: any) => {
          if(el.socketIndex === socketIndex) {
            out = el.iconUrl
          }
        })
      }
    }

    if(split[0] === "subclass") {
      // TODO: Fix this when summary images are made
      if(split[1] !== "supertree") {
        // @ts-ignore
        out = build.items.subclass.superConfig[split[1]].iconUrl
      }
    }

    if(split[0] === "item") {
      let item = this.getItemForInstanceId(split[1])
      if(item) {
        out = item.iconUrl
      }
    }
    return out
  }

  private getItemForInstanceId(instanceId: string): BuildItem {
    let retVal = new BuildItem()
    // @ts-ignore
    Object.keys(this.items).forEach(k => {
      // @ts-ignore
      if(this.items[k].itemInstanceId === instanceId) {
        // @ts-ignore
        retVal = this.items[k]
      }
    })
    return retVal
  }

  static async FromGuardianKey(bungieApiService: BungieApiService, manifestService: ManifestService, guardianKey: string): Promise<Build> {
    const build = new Build()
    let split = guardianKey.split("-")
    let meta = {
      membershipType: split[0],
      membershipId: split[1],
      guardianId: split[2]
    }
    let res = await Promise.all([
      bungieApiService.fetchCharacter(meta.membershipType, meta.membershipId, meta.guardianId),
      bungieApiService.fetchUserByMembershipAndPlatform(meta.membershipId, meta.membershipType)
    ])

    // User stuff
    const user = res[1]
    let selectedUser = {}
    if(user.bungieNetUser) {
      selectedUser = {
        displayName: user.bungieNetUser.uniqueName,
        bungieNetUserId: user.bungieNetUser.membershipId
      }
    }

    // @ts-ignore
    if(!selectedUser.displayName) {
      if(user.destinyMemberships && user.destinyMemberships.length > 0)  {
        let { bungieGlobalDisplayName, bungieGlobalDisplayNameCode } = user.destinyMemberships[0]
        selectedUser = {
          displayName: `${bungieGlobalDisplayName}#${bungieGlobalDisplayNameCode}`
        }
      }
    }
    build.selectedUser = selectedUser

    // Guardian stuff
    let characterData = res[0]
    build.class = characterData.character.classType

    build.stats = buildUtils.lookupCharacterStats(characterData, manifestService)
    const excludedSocketCateogies = [
      "ARMOR COSMETICS",
      "ARMOR PERKS",
      "WEAPON COSMETICS",
      "ARMOR TIER"
    ]
    build.items = buildUtils.lookupItemInstances(characterData, manifestService, excludedSocketCateogies)

    let classes = {
      0: "Titan",
      1: "Hunter",
      2: "Warlock"
    }
    // @ts-ignore
    build.name = (`${selectedUser.displayName}'s ${classes[build.class]}`)
    return build
  }
}

export type BuildUser = {
  bungieNetUserId?: string
  displayName?: string
  platformId?: string
}

export class BuildItem {
  slot?: string
  itemInstanceId?: string
  itemHash?: number
  ornamentIconUrl?: string
  iconUrl?: string
  affinityIcon?: string
  mods?: Array<BuildItemPlug>
  perks?: Array<BuildItemPlug>
  abilities?: Array<BuildItemPlug>
  fragments?: Array<BuildItemPlug>
  aspects?: Array<BuildItemPlug>
  super?: Array<BuildItemPlug>
  name?: string
  superConfig?: BuildSuperConfig
  isLightSubclass?: boolean
  damageType?: DamageTypeEnum

  getSubclassVersion(): number {
    if(this.aspects || this.fragments) {
      return 3
    } else if(this.superConfig) {
      return 2
    }
    return -1
  }

  static FromItem(item: Item): (BuildItem | undefined) {
    if(item.itemType === ItemTypeEnum.Weapon || item.itemType === ItemTypeEnum.Armor) {
      let equippedMods = item.getEquippedMods();
      let equippedPlugs = item.getEquippedPerks();
      let buildItem: BuildItem = {
        itemInstanceId: item._meta.inventoryItem.itemInstanceId,
        itemHash: item._meta.inventoryItem.itemHash,
        name: item.name,
        iconUrl: item.iconUrl,
        // @ts-ignore TODO: Fix this, types should match
        affinityIcon: item.getAffinityIcon(),
        perks: [],
        mods: []
      }
      if(equippedPlugs && equippedPlugs.length > 0) {
        equippedPlugs.forEach((plug: SocketItem) => {
          if(plug._meta) {
            let p = {
              plugHash: plug._meta.manifestDefinition.hash,
              iconUrl: plug.iconUrl,
              socketIndex: plug.socketIndex,
              name: plug.name,
              itemInstanceId: item._meta.inventoryItem.itemInstanceId,
              isEmpty: false
            }
            if(plug.name?.startsWith("Empty")) {
              p.isEmpty = true
            }
            if(buildItem.perks) {
              buildItem.perks.push(p)
            }
          }
        })
      }
      if(equippedMods && equippedMods.length > 0) {
        equippedMods.forEach((plug: SocketItem) => {
          if(plug._meta) {
            let p = {
              plugHash: plug._meta.manifestDefinition.hash,
              iconUrl: plug.iconUrl,
              socketIndex: plug.socketIndex,
              name: plug.name,
              itemInstanceId: item._meta.inventoryItem.itemInstanceId,
              isEmpty: false
            }
            if(plug.name?.startsWith("Empty")) {
              p.isEmpty = true
            }
            if(buildItem.mods) {
              buildItem.mods.push(p)
            }
          }
        })
      }
      return buildItem
    }

    // @ts-ignore TODO: This says its private???
    if(item.isSubclass()) {
      let buildItem = new BuildItem()
      buildItem.slot = "subclass"
      buildItem.itemInstanceId = item._meta.inventoryItem.itemInstanceId
      buildItem.itemHash = item._meta.inventoryItem.itemHash
      buildItem.name = item.name
      buildItem.iconUrl = item.iconUrl

      if(item.getSubclassVersion() === 3) {
        buildItem.abilities = []
        buildItem.aspects = []
        buildItem.fragments = []
        buildItem.super = []
        buildItem.damageType = item.damageType

        if(item.sockets) {
          let superSockets = item.sockets.filter((s: Socket) => s._meta?.categoryDefinition.displayProperties.name === "SUPER")
          superSockets.forEach((s: Socket) => {
            if(s.equippedPlug) {
              let plugItem: BuildItemPlug = {
                plugHash: s.equippedPlug._meta?.manifestDefinition.hash,
                iconUrl: s.equippedPlug.iconUrl,
                itemInstanceId: buildItem.itemInstanceId,
                socketIndex: s.position,
                name: s.equippedPlug.name,
                isEmpty: false // CANNOT be empty
              }
              buildItem.super?.push(plugItem)
            }
          })

          let abilitySockets = item.sockets.filter((s: Socket) => s._meta?.categoryDefinition.displayProperties.name === "ABILITIES")
          abilitySockets.forEach((s: Socket) => {
            if(s.equippedPlug) {
              let plugItem: BuildItemPlug = {
                plugHash: s.equippedPlug._meta?.manifestDefinition.hash,
                iconUrl: s.equippedPlug.iconUrl,
                itemInstanceId: buildItem.itemInstanceId,
                socketIndex: s.position,
                name: s.equippedPlug.name,
                isEmpty: false // CANNOT be empty
              }
              buildItem.abilities?.push(plugItem)
            }
          })

          let aspectSockets = item.sockets.filter((s: Socket) => s._meta?.categoryDefinition.displayProperties.name === "ASPECTS")
          aspectSockets.forEach((s: Socket) => {
            if(s.equippedPlug) {
              let plugItem: BuildItemPlug = {
                plugHash: s.equippedPlug._meta?.manifestDefinition.hash,
                iconUrl: s.equippedPlug.iconUrl,
                itemInstanceId: buildItem.itemInstanceId,
                socketIndex: s.position,
                name: s.equippedPlug.name,
                isEmpty: s.equippedPlug.name === "Empty Aspect Socket"
              }
              buildItem.aspects?.push(plugItem)
            }
          })

          let fragmentSockets = item.sockets.filter((s: Socket) => s._meta?.categoryDefinition.displayProperties.name === "FRAGMENTS")
          fragmentSockets.forEach((s: Socket) => {
            if(s.equippedPlug) {
              let plugItem: BuildItemPlug = {
                plugHash: s.equippedPlug._meta?.manifestDefinition.hash,
                iconUrl: s.equippedPlug.iconUrl,
                itemInstanceId: buildItem.itemInstanceId,
                socketIndex: s.position,
                name: s.equippedPlug.name,
                isEmpty: s.equippedPlug.name === "Empty Fragment Socket"
              }
              buildItem.fragments?.push(plugItem)
            }
          })
        }
      } else {
        buildItem.superConfig = {}
        buildItem.isLightSubclass = true

        if(item.damageType && buildItem.superConfig) {
          buildItem.superConfig.damageType = item.damageType
        }

        let grenade: any = item.getEquippedGrenade()
        if(grenade && buildItem.superConfig) {
          buildItem.superConfig.grenade = {
            iconUrl: `https://www.bungie.net${grenade.icon}`,
            name: grenade.name
          }
        }
        let movement: any = item.getEquippedMovementMode()
        if(movement && buildItem.superConfig) {
          buildItem.superConfig.movement = {
            iconUrl: `https://www.bungie.net${movement.icon}`,
            name: movement.name
          }
        }
        let specialty: any = item.getEquippedClassSpecialty()
        if(specialty && buildItem.superConfig) {
          buildItem.superConfig.specialty = {
            iconUrl: `https://www.bungie.net${specialty.icon}`,
            name: specialty.name
          }
        }
        let superTreeConfig = item.getEquippedSuperTree()
        // @ts-ignore
        buildItem.superConfig.treeTitle = superTreeConfig.name
        // @ts-ignore
        buildItem.superConfig.tree = superTreeConfig.pos
        // @ts-ignore
        buildItem.superConfig.treeNodes = []
        superTreeConfig.perks.forEach((p: any)=> {
          let node = {
            iconUrl: `https://www.bungie.net${p.icon}`,
            name: p.name
          }
          buildItem.superConfig?.treeNodes?.push(node)
        })
      }

      return buildItem
    }
    return undefined
  }
}

export type BuildSuperConfig = {
  tree?: number
  treeTitle?: string
  treeNodes?: Array<BuildSuperTreeNode>
  movement?: BuildItemPlug
  specialty?: BuildItemPlug
  grenade?: BuildItemPlug
  damageType?: Enums.DamageTypeEnum
}

export type BuildSuperTreeNode = {
  iconUrl?: string
}

export type BuildItemPlug = {
  name?: string
  isEmpty?: boolean
  plugHash?: string
  iconUrl?: string
  itemInstanceId?: string
  socketIndex?: number
}

export class BuildStatCollection {
  mobility?: BuildStat
  resilience?: BuildStat
  recovery?: BuildStat
  discipline?: BuildStat
  intellect?: BuildStat
  strength?: BuildStat
  power?: BuildStat

  constructor() {
    this.mobility = { value: 0 }
    this.resilience = { value: 0 }
    this.recovery = { value: 0 }
    this.discipline = { value: 0 }
    this.intellect = { value: 0 }
    this.strength = { value: 0 }
    this.power = { value: 0 }
  }
}

export type BuildStat = {
  name?: string
  icon?: string
  value?: number
}

export type BuildItemCollection = {
  subclass?: BuildItem
  kinetic?: BuildItem
  energy?: BuildItem
  power?: BuildItem
  helmet?: BuildItem
  arms?: BuildItem
  chest?: BuildItem
  legs?: BuildItem
  classItem?: BuildItem
}

export default Build