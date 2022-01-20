export default class BungieApiService {
  _apiKey: string
  _bungieNetBase: string = "https://www.bungie.net"
  _bungieNetApiBase: string = "https://www.bungie.net/Platform"

  constructor(apiKey: string) {
    this._apiKey = apiKey
  }

  membershipTypes = {
    Xbox: 1,
    Playstation: 2,
    Steam: 3,
    Stadia: 5
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

  async fetchManifestComponent(componentName: string, componentPath: string) {
    let res = await fetch(`${this._bungieNetBase}/${componentPath}`)
    let data = await res.json()
    return {
      componentName,
      data
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
      query = split[0]
    }

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

  async fetchUserInventory(token: string, membershipType: number, membershipId: string) {
    let comps = [ 102, 103, 200, 201, 300, 302, 303, 304, 305, 307, 308, 310, 600, 800 ]
    let url = `${this._bungieNetApiBase}/Destiny2/${membershipType}/Profile/${membershipId}`
    url += `?components=${comps.join(",")}`
    return await this.callBungieNet(url, "GET", { "Authorization": `Bearer ${token}`})
  }
}
