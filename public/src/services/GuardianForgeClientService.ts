import { BungieApiService } from "@guardianforge/destiny-data-utils"
import userUtils from "../utils/userUtils"
import GuardianForgeApiService from "./GuardianForgeApiService"

type SetAuthDataOptions = {
  fetchUserData?: boolean
}

type AuthData = {
  access_token: string
  expires_in: number
  issuedAt: number
  membership_id: string
  refresh_expires_in: number
  refresh_token: string
  token_type: string
}

export enum ErrorMessages {
  RefreshTokenExpired = "RefreshTokenExpired",
  ExpiresAtNotSet = "ExpiresAtNotSet",
  NoTokenSet = "NoTokenSet"
}

class TokenHandler {
  forgeApiService: GuardianForgeApiService
  token: string
  expiresAt: Date
  issuedAt: Date
  refreshToken: string
  refreshExpiresAt: Date
  timeoutJob?: NodeJS.Timeout

  constructor(forgeApiService: GuardianForgeApiService,
    access_token: string,
    expires_in: number,
    issuedAt: number,
    refresh_token: string,
    refresh_expires_in: number
  ) {
    this.forgeApiService = forgeApiService
    this.token = access_token
    this.expiresAt = new Date(new Date(issuedAt).getTime() + expires_in * 1000)
    this.issuedAt = new Date(issuedAt)
    this.refreshToken = refresh_token
    this.refreshExpiresAt = new Date(new Date(issuedAt).getTime() + refresh_expires_in * 1000)
  }

  /**
   * Checks the relevant dates, refreshes the token if needed, and sets up the refresh interval
   */
  async init() {
    let now = new Date()
    if(this.expiresAt < now) {
      console.log(this.expiresAt, now)
      if(this.refreshExpiresAt < now) {
        await this.refresh()
      } else {
        throw new Error(ErrorMessages.RefreshTokenExpired)
      }
    }
    this.watch()
  }

  isTokenValid(): boolean {
    let now = new Date()
    if(now < this.expiresAt) {
      return true
    }
    return false
  }

  /**
   * Sets up a timeout job to refresh the token
   */
  watch() {
    if(this.expiresAt) {
      let waitMs = (this.expiresAt.getTime() - Date.now() - 10)
      let self = this
      console.log(`(TokenHandler.watch) Waiting ${waitMs}ms until refresh`)
      this.timeoutJob = setTimeout(async () => {
        await self.refresh()
        self.unwatch()
        self.watch()
      }, waitMs)
    } else {
      throw new Error(ErrorMessages.ExpiresAtNotSet)
    }
  }


  /**
   * Unsets the timeout job to refresh the token
   */
  unwatch() {
    if(this.timeoutJob) {
      clearTimeout(this.timeoutJob)
    }
  }

  /**
   * Refreshes the token
   */
  async refresh() {
    console.log("(TokenHandler.refresh) Refreshing token...")
    if(this.refreshExpiresAt < new Date()) {
      throw new Error(ErrorMessages.RefreshTokenExpired)
    }
    let authData =  await this.forgeApiService.refreshToken(this.refreshToken) as AuthData
    authData.issuedAt = Date.now()
    localStorage.setItem("auth", JSON.stringify(authData))
    this.token = authData.access_token
    this.expiresAt = new Date(new Date().getTime() + (authData.expires_in * 1000))
    this.issuedAt = new Date()
    this.refreshToken = authData.refresh_token
    this.refreshExpiresAt = new Date(new Date().getTime() + (authData.refresh_expires_in * 1000))
  }
}

export default class GuardianForgeClientService {
  config: AppConfig
  bungieApiService: BungieApiService
  forgeApiService: GuardianForgeApiService

  // Authentication Info
  authData?: AuthData
  tokenHandler?: TokenHandler

  // TODO: Make models of all these
  latestBuilds: any
  userData: any
  userInfo: any
  isUserDataLoaded: boolean = false
  userUpvotes: any
  userBuilds: any
  privateBuilds: any
  userGuardians: any
  userBookmarks: any
  userPrivateBuilds: any

  constructor (config: AppConfig, forgeApiService: GuardianForgeApiService, bungieApiService: BungieApiService) {
    this.config = config
    this.bungieApiService = bungieApiService
    this.forgeApiService = forgeApiService

    this.userData = null
    this.userInfo = null

    // User-specific stuff
    this.userUpvotes = null
    this.userBuilds = null
    this.userGuardians = null
    this.userBookmarks = null
    this.userPrivateBuilds = null
  }

  async init() {
    let authData = localStorage.getItem("auth")
    if(authData) {
      await this.setAuthData(authData)
    }
  }

  async setAuthData(authData: any, opts?: SetAuthDataOptions) {
    if(typeof(authData) === "string") {
      localStorage.setItem("auth", authData)
      authData = JSON.parse(authData)
    } else {
      localStorage.setItem("auth", JSON.stringify(authData))
    }

    try {
      this.authData = authData
      if(this.authData && !this.tokenHandler) {
        this.tokenHandler = new TokenHandler(
          this.forgeApiService,
          this.authData.access_token,
          this.authData.expires_in,
          this.authData.issuedAt,
          this.authData.refresh_token,
          this.authData.refresh_expires_in)
          await this.tokenHandler.init()
      }

      let userData = await this.bungieApiService.fetchUserMemberships(authData.membership_id)
      this.userData = userData

      if(opts && opts.fetchUserData === true) {
        await this.fetchUserData()
      }
    } catch (err: any) {
      if(err.message == ErrorMessages.RefreshTokenExpired) {
        // User needs to log in again
        this.clearAuthData()
      }
    }
  }

  clearAuthData() {
    this.authData = undefined
    this.tokenHandler = undefined
    localStorage.removeItem("auth")
  }

  async fetchUserData(force?: boolean) {
    if(this.isLoggedIn()) {
      if(!this.isUserDataLoaded || force === true) {
        let token = this.getToken()
        let { membershipType, membershipId } = userUtils.parseMembershipFromProfile(this.userData)
        if(token) {
          let res = await Promise.all([
            this.forgeApiService.fetchMe(token, { builds: true, upvotes: true, bookmarks: true, privateBuilds: true }),
            this.bungieApiService.fetchCharactersList(membershipType, membershipId)
          ])

          let guardians = Object.keys(res[1].characters.data).map(key => res[1].characters.data[key])
          // @ts-ignore TODO: Make
          guardians.sort((a:any , b: any) => new Date(b.dateLastPlayed) - new Date(a.dateLastPlayed))

          this.userInfo = res[0].user
          this.userBuilds = res[0].builds
          this.userBookmarks = res[0].bookmarks
          this.userUpvotes = res[0].upvotes
          this.privateBuilds = res[0].privateBuilds
          this.userGuardians = guardians
          this.isUserDataLoaded = true
        }
      }
    }
  }

  getToken(): string {
    if(this.tokenHandler && this.tokenHandler.token) {
      return this.tokenHandler.token
    } else {
      throw new Error(ErrorMessages.NoTokenSet)
    }
  }

  isLoggedIn(): boolean {
    if(this.tokenHandler && this.tokenHandler.isTokenValid()) {
      return true
    }
    return false
  }

  isPremiumUser(): boolean {
    if(this.userInfo && this.userInfo.subscriptionDetails && (this.userInfo.subscriptionDetails.endDate * 1000) > new Date().getTime()) {
      return true
    }
    return false
  }

  isAdmin() {
    if(this.userData && this.userData.bungieNetUser && this.userData.bungieNetUser.membershipId === "14214042") {
      return true
    }
    return false
  }

  logout() {
    this.clearAuthData()
    // @ts-ignore
    window.location = "/"
  }

  async completeLogin(authCode: string) {
    let res = await fetch(`${this.config.apiBase}/oauth/code`, {
      method: "post",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        // @ts-ignore
        code: authCode
      })
    })
    let json = await res.json()
    if(json.error) {
      throw new Error(`Error logging in (${json.error})`)
    }
    json.issuedAt = Date.now()
    await this.setAuthData(json, {
      fetchUserData: true
    })
  }

  async createBuildOpengraphImage(buildId: string) {
    let token = this.getToken()
    return await this.forgeApiService.createBuildOpengraphImage(token, buildId)
  }

  async createSubscriptionIntent(priceId: string) {
    let token = this.getToken()
    let res = await fetch(`${this.config.apiBase}/subscriptions/create-intent`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        priceId
      })
    })
    return await res.json()
  }
}