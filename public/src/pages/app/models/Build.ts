import BuildSummary from "./BuildSummary";

class Build {
  primaryActivity?: string
  inputStyle?: string
  notes?: string
  stats?: BuildStatCollection
}

export type BuildItem = {
  itemInstanceId?: string
  ornamentIconUrl?: string
  iconUrl?: string
  affinityIcon?: string
  mods?: Array<BuildItemPlug>
  perks?: Array<BuildItemPlug>
  abilities?: Array<BuildItemPlug>
  fragments?: Array<BuildItemPlug>
  aspects?: Array<BuildItemPlug>
  name?: string
  superConfig?: BuildSuperConfig
  isLightSubclass?: boolean
}

export type BuildSuperConfig = {
  tree?: number
  treeTitle?: string
  treeNodes?: Array<BuildSuperTreeNode>
  movement?: BuildItemPlug
  specialty?: BuildItemPlug
  grenade?: BuildItemPlug
}

export type BuildSuperTreeNode = {
  iconUrl?: string
}

export type BuildItemPlug = {
  name?: string
  isEmpty?: boolean
  plugHash?: string
  iconUrl?: string
  itemInstanceId?: string
  socketIndex?: number
}

export type BuildStatCollection = {
  mobility?: BuildStat
  resilience?: BuildStat
  recovery?: BuildStat
  discipline?: BuildStat
  intellect?: BuildStat
  strength?: BuildStat
}

export type BuildStat = {
  icon?: string
  value?: string
}

export default Build