type FetchMeOptions = {
  upvotes?: boolean
  bookmarks?: boolean
  builds?: boolean
  privateBuilds?: boolean
}

export default class GuardianForgeApiService {
  _apiBase: string
  _dataBucketName: string
  _region: string

  constructor(apiBase: string, dataBucketName: string, region: string) {
    this._apiBase = apiBase
    this._dataBucketName = dataBucketName
    this._region = region
  }

  async refreshToken(refreshToken: string) {
    let res = await fetch(`${this._apiBase}/oauth/refresh`, {
      method: "post",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        refresh_token: refreshToken
      })
    })
    return await res.json()
  }

  // TODO: Use a model for build data
  async createBuild(buildData: any, token?: string) {
    let opts: any = {
      method: "post",
      body: JSON.stringify(buildData)
    }
    if(token) {
      opts.headers = {
        "Authorization": `Bearer ${token}`
      }
    }
    let res = await fetch(`${this._apiBase}/builds`, opts)
    let data = await res.json()
    return data.buildId
  }

  // TODO: Make a model for updates
  async updateBuild(buildId: string, updates: any, token: string) {
    await fetch(`${this._apiBase}/builds/${buildId}`, {
      method: "put",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    })
  }

  async archiveBuild(buildId: string, token: string) {
    await fetch(`${this._apiBase}/builds/${buildId}`, {
      method: "delete",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
  }

  async fetchLatestBuilds() {
    let res = await fetch(`${this._apiBase}/builds/latest`)
    return await res.json()
  }

  async fetchBuild(buildId: string) {
    let res = await fetch(`https://${this._dataBucketName}.s3-${this._region}.amazonaws.com/builds/${buildId}.json`)
    return await res.json()
  }

  async fetchMyBuilds(token: string) {
    let res = await fetch(`${this._apiBase}/me/builds`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
    return await res.json()
  }

  async fetchMyBookmarks(token: string) {
    let res = await fetch(`${this._apiBase}/me/bookmarks`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
    return await res.json()
  }

  async fetchMe(token: string, options?: FetchMeOptions) {
    let fetchOpts = []
    let url = `${this._apiBase}/me`
    if(options && options.upvotes) {
      fetchOpts.push("upvotes")
    }
    if(options && options.bookmarks) {
      fetchOpts.push("bookmarks")
    }
    if(options && options.builds) {
      fetchOpts.push("builds")
    }
    if(options && options.privateBuilds) {
      fetchOpts.push("privateBuilds")
    }
    if(fetchOpts.length > 0) {
      url += `?fetch=${fetchOpts.join(",")}`
    }
    let res = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
    return await res.json()
  }

  // TODO: Create a model for updates
  async updateMe(token: string, updates: any) {
    let res = await fetch(`${this._apiBase}/me`, {
      method: "put",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(updates)
    })
    if(!res.ok) {
      let msg = await res.text()
      throw msg
    }
  }

  async fetchForgeUser(membershipId: string) {
    let res = await fetch(`${this._apiBase}/users/${membershipId}`)
    return await res.json()
  }

  // TODO: Create a model for build summary
  async bookmarkBuild(token: string, buildSummary: any) {
    let res = await fetch(`${this._apiBase}/me/bookmarks`, {
      method: "put",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(buildSummary)
    })
    return await res.json()
  }

  async fetchMyUpvotes(token: string) {
    let res = await fetch(`${this._apiBase}/me/upvotes`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
    return await res.json()
  }

  // TODO: Create a model for build summary
  async upvoteBuild(token: string, buildSummary: any) {
    let res = await fetch(`${this._apiBase}/me/upvotes`, {
      method: "put",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(buildSummary)
    })
    return await res.json()
  }

  async getUpvoteCount(buildId: string) {
    let res = await fetch(`${this._apiBase}/builds/upvotes/${buildId}`)
    return await res.text()
  }

  // TODO: Check if this is even available, remove if it isnt
  async searchBuilds(guardianClass: any, guardianSubclass: any, activityId: any) {
    let query: any = {}
    if (guardianClass !== null) {
      query.class = guardianClass
    }
    if (guardianSubclass !== null) {
      query.subclass = guardianSubclass
    }
    if (activityId !== null) {
      query.activity = activityId
    }
    let res = await fetch(`${this._apiBase}/search`, {
      method: "post",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(query)
    })
    return await res.json()
  }

  // TODO: Create a model for errorMessage
  async reportError(errorMessage: any) {
    await fetch(`${this._apiBase}/report/error`, {
      method: "post",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(errorMessage)
    })
  }
}
