import BuildSummary from "./BuildSummary"

type User = {
  bungieGlobalDisplayName?: string
  bungieGlobalDisplayNameCode?: number
  bungieNetUser?: BungieNetUser
  bungieNetUserId?: string
  displayName?: string
  userInfo?: UserInfo
  builds?: Array<BuildSummary>
  user?: UserInfo
  // TODO: Create a model from this
  destinyMemberships?: Array<any>
}

export type BungieNetUser = {
  displayName?: string
  membershipId?: string
  profilePicturePath?: string
  uniqueName?: string
}

export type UserInfo = {
  about?: string
  social?: SocialInfo
  uniqueName?: string
  subscriptionDetails?: SubscriptionDetails
}

export type SubscriptionDetails = {
  subscriptionId?: string
  startDate?: number
  endDate?: number
  autoRenew?: boolean
}

export type SocialInfo = {
  twitter?: string
  twitch?: string
  youtube?: string
  facebook?: string
}

export default User