import BuildSummary from "./BuildSummary"

type User = {
  bungieGlobalDisplayName?: string
  bungieGlobalDisplayNameCode?: number
  bungieNetUser?: BungieNetUser
  userInfo?: UserInfo
  builds?: Array<BuildSummary>
}

export type BungieNetUser = {
  displayName?: string
  membershipId?: string
  profilePicturePath?: string
}

export type UserInfo = {
  about?: string
  social?: SocialInfo
  uniqueName?: string
}

export type SocialInfo = {
  twitter?: string
  twitch?: string
  youtube?: string
  facebook?: string
}

export default User