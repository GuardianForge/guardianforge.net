import { BungieApiService } from "@guardianforge/destiny-data-utils"
import Build from "../models/Build"
import BuildSummary from "../models/BuildSummary"
import DestinyMembership from "../models/DestinyMembership"
import Guardian from "../models/Guardian"

export class ForgeUser {
  membership?: DestinyMembership
  bungieId?: string
  builds?: Array<BuildSummary>
  bookmarks?: Array<BuildSummary>
  privateBuilds?: Array<BuildSummary>
  upvotes?: Array<string>
  guardians?: Array<Guardian>

  getToken() {

  }
}

class ForgeClient {
  apiBase?: string
  user?: ForgeUser

  constructor(config: AppConfig, bungieApiService: BungieApiService) {
    this.apiBase = config.apiBase
  }

  async init() {

  }

  getToken() {

  }

  getBookmarks() {

  }

  getBuilds() {

  }

  getPrivateBuilds() {

  }

  isLoggedIn() {
    return this.user !== undefined
  }

  // #region - Users
  async getUserById(bungieId: string) {

  }
  // #endregion

  // #region - Builds
  // async getBuild(buildId: string): Build {

  // }

  // async createBuild(build: Build): string {

  // }

  async updateBuild(buildId: string, updates: BuildUpdates) {

  }

  async bookmarkBuild() {

  }

  async upvoteBuild(buildId: string) {

  }

  async archiveBuild(buildId: string) {

  }

  async getUpvotesForBuild(buildId: string) {

  }

  async getLatestBuilds() {

  }
  // #endregion
}

type BuildUpdates = {

}

export default ForgeClient