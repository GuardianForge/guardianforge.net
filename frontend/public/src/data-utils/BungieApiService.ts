export enum ComponentTypeEnum {
  None = 0,
  Profiles = 100,
  VendorReceipts = 101,
  ProfileInventories = 102,
  ProfileCurrencies = 103,
  ProfileProgression = 104,
  PlatformSilver = 105,
  Characters = 200,
  CharacterInventories = 201,
  CharacterProgressions = 202,
  CharacterRenderData = 203,
  CharacterActivities = 204,
  CharacterEquipment = 205,
  ItemInstances = 300,
  ItemObjectives = 301,
  ItemPerks = 302,
  ItemRenderData = 303,
  ItemStats = 304,
  ItemSockets = 305,
  ItemTalentGrids = 306,
  ItemCommonData = 307,
  ItemPlugStates = 308,
  ItemPlugObjectives = 309,
  ItemReusablePlugs = 310,
  Vendors = 400,
  VendorCategories = 401,
  VendorSales = 402,
  Kiosks = 500,
  CurrencyLookups = 600,
  PresentationNodes = 700,
  Collectibles = 800,
  Records = 900,
  Transitory = 1000,
  Metrics = 1100,
  StringVariables = 1200
}

export enum BungieMembershipType {
  None = 0,
  Xbox = 1,
  Psn = 2,
  Steam = 3,
  Blizzard = 4,
  Stadia = 5,
  Demon = 10,
  BungieNext = 254,
  All = -1
}

// TODO: Build this out
type GetProfileResponse = {
  profileInventory: any
  itemComponents: any
  profilePlugSets: any
  characterInventories: any
  characterPlugSets: any
  characterCurrencyLookups: any
  characters: any
  characterEquipment: any
}

type GetMembershipDataForCurrentUserResponse = {
  destinyMemberships: any
  primaryMembershipId: number
  bungieNetUser: any
}

export class BungieApiService {
  _apiKey: string
  _bungieNetBase: string = "https://www.bungie.net"
  _bungieNetApiBase: string = "https://www.bungie.net/Platform"
  _clientId?: string

  constructor(apiKey: string) {
    this._apiKey = apiKey
  }

  // TODO: Figure out what headers should be
  async callBungieNet(url: string, method?: string, additionalHeaders?: any) {
    if(!method) {
      method = "get"
    }
    let headers = {
      'X-API-Key': this._apiKey
    }
    if(additionalHeaders != null) {
      // @ts-ignore
      Object.keys(additionalHeaders).forEach(k => headers[k] = additionalHeaders[k])
    }

    let res = await fetch(url, {
      method: method,
      headers
    })
    let data = await res.json()
    return data.Response
  }

  /**
   * Gets profile info based on the passed in components
   * @param membershipType - The users platform
   * @param destinyMembershipId - The users unique Destiny membership id
   * @param components - An array of components to fetch
   * @param token - The users access token
   */
  async GetProfile(membershipType: BungieMembershipType, destinyMembershipId: string, components: Array<ComponentTypeEnum>, token?: string): Promise<GetProfileResponse> {
    let url = `${this._bungieNetApiBase}/Destiny2/${membershipType}/Profile/${destinyMembershipId}`
    url += `/?components=${components.join(",")}`
    if(token) {
      return await this.callBungieNet(url, "GET", { "Authorization": `Bearer ${token}`})
    } else {
      return await this.callBungieNet(url, "GET")
    }
  }


  async GetMembershipDataForCurrentUser(token: string): Promise<GetMembershipDataForCurrentUserResponse> {
    let url = `${this._bungieNetApiBase}/User/GetMembershipsForCurrentUser`
    return await this.callBungieNet(url, "GET", { "Authorization": `Bearer ${token}`})
  }

  async fetchManifestComponent(componentName: string, componentPath: string) {
    try {
      let res = await fetch(`${this._bungieNetBase}/${componentPath}`)
      let data = await res.json()
      return {
        componentName,
        data
      }
    } catch (err) {
      console.error("(BungieApiService.fetchManifestComponent) failed to fetch:", err, componentName, componentPath)
      throw err
    }
  }

  async fetchManifest() {
    let res = await fetch(`${this._bungieNetApiBase}/Destiny2/Manifest`, {
      headers: {
        'X-API-Key': this._apiKey
      }
    })
    let data = await res.json()
    return data.Response
  }

  async searchDestinyPlayers(platformId: string, displayName: string) {
    return await this.callBungieNet(`${this._bungieNetApiBase}/Destiny2/SearchDestinyPlayer/${platformId}/${displayName}`)
  }

  async searchBungieNetUsers(query: string, pageNumber?: number) {
    if(!pageNumber) {
      pageNumber = 0
    }

    if(query.includes("#")) {
      let split = query.split("#")
      // Check if the last el is a number and remove it if so
      if(!isNaN(Number(split[split.length - 1]))) {
        split.pop()
      }
      query = split.join("#")
    }
    query = encodeURIComponent(query)

    // TODO: Create a model around this
    let searchResults: any = []

    let res = await this.callBungieNet(`${this._bungieNetApiBase}/User/Search/Prefix/${query}/${pageNumber}/`)
    if(res.searchResults) {
      searchResults = searchResults.concat(res.searchResults)
    }

    let hasMore = res.hasMore
    while(hasMore && pageNumber < 5) {
      try {
        pageNumber++
        let res2 = await this.callBungieNet(`${this._bungieNetApiBase}/User/Search/Prefix/${query}/${pageNumber}/`)

        if(res2.searchResults) {
          searchResults = searchResults.concat(res2.searchResults)
        }

        if(res2.hasMore) {
          hasMore = res2.hasMore
        } else {
          hasMore = false
        }
      } catch (err) {
        console.warn("(BungieApiService.findUsers): ", err)
        hasMore = false
      }
    }

    return searchResults
  }

  async fetchCharactersList(platformId: string, membershipId: string) {
    return await this.callBungieNet(`${this._bungieNetApiBase}/Destiny2/${platformId}/Profile/${membershipId}/?components=200`)
  }

  async fetchCharacter(platformId: string, membershipId: string, characterId: string) {
    let comps = [ 200, 205, 300, 302, 304, 305, 306, 307, 308, 310 ]
    let url = `${this._bungieNetApiBase}/Destiny2/${platformId}/Profile/${membershipId}/Character/${characterId}`
    url += `?components=${comps.join(",")}`
    let res = await this.callBungieNet(url)
    return {
      character:     res.character.data,
      equipment:     res.equipment.data.items,
      instances:     res.itemComponents.instances.data,
      perks:         res.itemComponents.perks.data,
      stats:         res.itemComponents.stats.data,
      sockets:       res.itemComponents.sockets.data,
      plugStates:    res.itemComponents.plugStates.data,
      reusablePlugs: res.itemComponents.reusablePlugs.data,
      talentGrids:   res.itemComponents.talentGrids.data,
    }
  }

  async fetchBungieUser(userId: string) {
    return await this.callBungieNet(`${this._bungieNetApiBase}/User/GetBungieNetUserById/${userId}`)
  }

  async fetchUserByMembershipAndPlatform(membershipId: string, platformId: string) {
    return await this.callBungieNet(`${this._bungieNetApiBase}/User/GetMembershipsById/${membershipId}/${platformId}/`)
  }

  async fetchUserMemberships(membershipId: string) {
    return await this.callBungieNet(`${this._bungieNetApiBase}/User/GetMembershipsById/${membershipId}/all/`)
  }

  /**
   * @deprecated GetProfile should be used instead
   */
  async fetchUserInventory(token: string, membershipType: number, membershipId: string) {
    let comps = [ 102, 103, 200, 201, 300, 302, 303, 304, 305, 307, 308, 310, 600, 800 ]
    let url = `${this._bungieNetApiBase}/Destiny2/${membershipType}/Profile/${membershipId}`
    url += `/?components=${comps.join(",")}`
    return await this.callBungieNet(url, "GET", { "Authorization": `Bearer ${token}`})
  }
}
