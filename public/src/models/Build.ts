import { BungieApiService, Enums, Item, ManifestService, SocketItem } from "@guardianforge/destiny-data-utils"
import { ItemTypeEnum } from "@guardianforge/destiny-data-utils/dist/models/Enums"
// @ts-ignore
import buildUtils from "../utils/buildUtils"

class Build {
  primaryActivity?: string
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
  name?: string
  superConfig?: BuildSuperConfig
  isLightSubclass?: boolean

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
    if(item.itemType === ItemTypeEnum.Subclass) {
      if(item.getSubclassVersion() === 3) {
        // TODO: Implement v3 subclass
      } else {
        // V2 Subclass
        let buildItem: BuildItem = {
          itemInstanceId: item._meta.inventoryItem.itemInstanceId,
          itemHash: item._meta.inventoryItem.itemHash,
          name: item.name,
          iconUrl: item.iconUrl,
          superConfig: {},
          isLightSubclass: true
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
        return buildItem
      }
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