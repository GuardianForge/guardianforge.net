import BuildSummary from "./BuildSummary"

type User = {
  bungieGlobalDisplayName?: string
  bungieGlobalDisplayNameCode?: number
  bungieNetUser?: BungieNetUser
  userInfo?: UserInfo
  builds?: Array<BuildSummary>
}

type BungieNetUser = {
  displayName?: string
  membershipId?: string
  profilePicturePath?: string
}

type UserInfo = {
  about?: string
  social?: SocialInfo
}

type SocialInfo = {
  twitter?: string
  twitch?: string
  youtube?: string
  facebook?: string
}

export default User