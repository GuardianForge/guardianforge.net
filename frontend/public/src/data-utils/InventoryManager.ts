import { BungieApiService, BungieMembershipType, ComponentTypeEnum } from "./BungieApiService";
import { Item } from "./models/Item";
import { Socket } from "./models/Socket";
import { ClassEnum, SocketTypeEnum, BucketTypeEnum, ItemTypeEnum, ItemSubTypeEnum } from "./models/Enums";
import { ManifestService } from "./ManifestService";

export type UserInventory = {
  items: Item[]
}

export class InventoryManager {
  _bungieApiService: BungieApiService
  _manifestService: ManifestService
  _inventory: UserInventory

  // Events
  onInventoryLoaded?: Function

  constructor(bungieApiService: BungieApiService, manifestService: ManifestService) {
    this._bungieApiService = bungieApiService
    this._manifestService = manifestService
    this._inventory = {
      items: []
    }
  }

  /**
   * Fetches the users' inventory and populates relevant data using various manifest components
   * @param membershipType The membershipType of the user
   * @param membershipId The membershipId of the user
   * @param token The users' OAuth token
   */
  async loadInventory(membershipType: BungieMembershipType, membershipId: string, token: string) {
    let comps = [
      ComponentTypeEnum.ProfileInventories,
      ComponentTypeEnum.ProfileCurrencies,
      ComponentTypeEnum.Characters,
      ComponentTypeEnum.CharacterInventories,
      ComponentTypeEnum.CharacterEquipment,
      ComponentTypeEnum.ItemInstances,
      ComponentTypeEnum.ItemPerks,
      ComponentTypeEnum.ItemStats,
      ComponentTypeEnum.ItemSockets,
      ComponentTypeEnum.ItemTalentGrids,
      ComponentTypeEnum.ItemCommonData,
      ComponentTypeEnum.ItemPlugStates,
      ComponentTypeEnum.ItemReusablePlugs,
      ComponentTypeEnum.CurrencyLookups
    ]
    let getProfileResponse = await this._bungieApiService.GetProfile(membershipType, membershipId, comps, token)
    const {
      profileInventory,
      itemComponents,
      profilePlugSets,
      characterInventories,
      characterPlugSets,
      characterEquipment,
      characters
    } = getProfileResponse

    profileInventory.data.items.forEach((el: any) => {
      // TODO: Turn these locations into an enum
      let item = new Item(el, itemComponents, "profileInventory", profilePlugSets.data, itemComponents.talentGrids.data)
      this._inventory?.items.push(item)
    })

    Object.keys(characterInventories.data).forEach((k: string) => {
      characterInventories.data[k].items.forEach((el: any) => {
        let item = new Item(el, itemComponents, "characterInventories", characterPlugSets.data[k], itemComponents.talentGrids.data)
        if(characters && characters.data && characters.data[k]) {
          item.location = characters.data[k]
        }
        this._inventory?.items.push(item)
      })
    })

    Object.keys(characterPlugSets.data).forEach((characterId: string) => {
      Object.keys(characterPlugSets.data[characterId].plugs).forEach((k: any) => {
        characterPlugSets.data[characterId].plugs[k].forEach((plug: any) => {
          let item = new Item(plug, itemComponents, "characterPlugSets")
          this._inventory?.items.push(item)
        })
      })
    })

    Object.keys(characterEquipment.data).forEach((k: string) => {
      characterEquipment.data[k].items.forEach((el: any) => {
        let item = new Item(el, itemComponents, "characterEquipment", characterPlugSets.data[k], itemComponents.talentGrids.data)
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
        this._inventory?.items.push(item)
      })
    })

    this._inventory.items.forEach((i: Item) => i.populate(this._manifestService))

    if(this.onInventoryLoaded) {
      this.onInventoryLoaded(this._inventory)
    }
  }

  /**
   * Returns an array of Items that match the available subclasses for a given Class
   * @param classType A value of ClassEnum
   * @returns An array of Items
   */
  getAvailableSubclasses(classType: ClassEnum): Array<Item> {
    return this.lookupItems(undefined, undefined, classType, BucketTypeEnum.Subclass)
  }

  /**
   * Searches the users inventory based on the provided filters and returns an array of items that match
   * @param type A value of ItemTypeEnum
   * @param subType A value of ItemSubTypeEnum
   * @param classType A value of ClassEnum
   * @param slot A value of BucketTypeEnum
   * @returns An array of items that match the provided filters
   */
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

  /**
   * Builds a map of all available mods for a given item.
   * @param item A socketed Item
   * @returns A map of socket index/position (key) to item array (value). Returns null if the item has no sockets.
   */
  // getModsForItem(item: Item): (Map<number, Item[]> | null) {
  //   if(!item.sockets) {
  //     return null
  //   }

  //   let whitelistPlugHashes: any = {}

  //   item.sockets.forEach((socket: Socket) => {
  //     if(socket._meta?.categoryDefinition &&
  //       socket.position !== undefined &&
  //       (socket._meta?.categoryDefinition?.hash === SocketTypeEnum.WeaponMods ||
  //       socket._meta?.categoryDefinition.hash === SocketTypeEnum.ArmorMods)) {
  //         let hashes = socket._meta.typeDefinition.plugWhitelist.map((pwl: any) => pwl.categoryHash)
  //         whitelistPlugHashes[socket.position] = hashes
  //       }
  //   })

  //   let socketPlugMap: Map<number, Item[]> = new Map<number, Item[]>()

  //   Object.keys(whitelistPlugHashes).forEach((key: string) => {
  //     let items: Item[] = []
  //     whitelistPlugHashes[key].forEach((hash: number) => {
  //       this._inventory?.items.forEach((i: Item) => {
  //         if(i._meta.manifestDefinition.plug && i._meta?.manifestDefinition?.plug?.plugCategoryHash === hash) {
  //           if(!items.find((ci: Item) => ci.hash === i.hash)) {
  //             items.push(i)
  //           }
  //         }
  //       })
  //     })

  //     if(items) {
  //       socketPlugMap.set(Number(key), items)
  //     }
  //   })

  //   return socketPlugMap
  // }

  /**
   * Builds a map of all available plugs for a given item.
   * @param item - The item to lookup
   * @returns A map of socket index/position (key) to item array (value). Returns null if the item has no sockets.
   */
  getSocketPlugMapForItem(item: Item): (Map<number, Item[]> | null) {
    if(!item.sockets) {
      return null
    }

    let whitelistPlugHashes: any = {}

    item.sockets.forEach((socket: Socket) => {
      if(socket._meta?.categoryDefinition && socket.position !== undefined) {
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
      }
    })

    return socketPlugMap
  }

  /**
   * Returns the Item from the users' inventory that matches the itemInstanceId provided
   * @param itemInstanceId The item's instance Id
   * @returns The Item if found, or null if no item can be found
   */
  getItemForInstanceId(itemInstanceId: string): (Item | null) {
    let item = this._inventory.items.find((i: Item) => i._meta && i._meta.inventoryItem && i._meta.inventoryItem.itemInstanceId === itemInstanceId)
    if(item) {
      return item
    }
    return null
  }

  /**
   * Search the users' inventory for all items that match the provided hash
   * @param hash A hash from the DestinyInventoryItemComponent manifest component
   * @returns An array of items that match the provided hash, or null of no items are found
   */
  getItemsByHash(hash: number): (Item[] | null) {
    let items = this._inventory.items.filter((i: Item) => i.hash && i.hash === hash)
    if(items) {
      return items
    }
    return null
  }
}