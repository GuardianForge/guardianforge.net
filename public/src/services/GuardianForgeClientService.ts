import userUtils from "../utils/userUtils"
import BungieApiService from "./BungieApiService"
import GuardianForgeApiService from "./GuardianForgeApiService"

type SetAuthDataOptions = {
  fetchUserData?: boolean
}

export default class GuardianForgeClientService {
  config: AppConfig
  bungieApiService: BungieApiService
  forgeApiService: GuardianForgeApiService
  latestBuilds: any
  // TODO: Make models of all these
  userData: any
  authData: any
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
    this.authData = null
    this.userInfo = null

    // User-specific stuff
    this.userUpvotes = null
    this.userBuilds = null
    this.userGuardians = null
    this.userBookmarks = null
    this.userPrivateBuilds = null
  }

  async init() {
    // Check localstorage for token, reauth if needed, or prompt to log back in
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
    this.authData = authData

    let userData = await this.bungieApiService.fetchUserMemberships(authData.membership_id)
    this.userData = userData

    if(opts && opts.fetchUserData === true) {
      await this.fetchUserData()
    }
  }

  async fetchUserData(force?: boolean) {
    if(this.isLoggedIn()) {
      if(!this.isUserDataLoaded || force === true) {
        let token = await this.getToken()
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

  async getToken(opts?: any) {
    try {
      let forceLogin = true
      if(opts) {
        if(opts.forceLogin !== null && opts.forceLogin !== undefined) {
          forceLogin = opts.forceLogin
        }
      }

      let authData = this.authData
      let now = Date.now()
      let requiresRelogin = false
      let requiresReloginReason = ""

      if(!authData || !authData.access_token) {
        console.warn("requiresRelogin due to !authData")
        requiresReloginReason = "No auth token."
        requiresRelogin = true
      }


      // if(!state.token) {
      //   console.warn("requiresRelogin due to !state.token")
      //   requiresReloginReason = "No auth token."
      //   requiresRelogin = true
      // }

      if(authData && !authData.issuedAt) {
        console.warn("requiresRelogin due to !authData.issuedAt")
        requiresReloginReason = "Token has expired."
        requiresRelogin = true
      }

      if(!requiresRelogin) {
        let expiry = authData.issuedAt + (authData.expires_in * 1000)
        if (now > expiry) {
          let refreshExpiry = authData.issuedAt + (authData.refresh_expires_in * 1000)
          if (now > refreshExpiry) {
            console.warn("requiresRelogin due to expired refresh")
            requiresReloginReason = "Token has expired."
            requiresRelogin = true
          } else {
            let refreshRes = await this.forgeApiService.refreshToken(authData.refresh_token)
            refreshRes.issuedAt = Date.now()
            this.authData = refreshRes
            return refreshRes.access_token
          }
        } else {
          return authData.access_token
        }
      }

      if(requiresRelogin && !forceLogin) {
        return null
      }

      // commit("alerts/addAlert", {
      //   title: "Login Needed",
      //   body: `You need to log in to do that (Reason: ${requiresReloginReason})`,
      //   opts: {
      //     autohide: false
      //   },
      //   buttons: [
      //     {
      //       title: "Login",
      //       fn: () => state.service.redirectToLogin()
      //     }
      //   ]
      // }, { root: true})
      return false
      // state.service.redirectToLogin()
    } catch (err) {
      console.error("store/auth.getToken", err)
      // state.service.redirectToLogin()
    }
  }

  isLoggedIn () {
    if(this.userData && this.userData.bungieNetUser) {
      return true
    }
    return false
  }

  logout() {
    localStorage.removeItem("auth")
    // @ts-ignore
    window.location = "/"
  }
}