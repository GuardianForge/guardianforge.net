import { SocketTypeEnum } from "./Enums"
import { SocketItem } from "./SocketItem"

export type SocketMeta = {
  plugSet?: any
  typeDefinition?: any
  categoryDefinition?: any
  itemSocketMeta?: any
}

export class Socket {
  _meta?: SocketMeta
  type?: SocketTypeEnum
  position?: number
  equippedPlug?: SocketItem
  availablePlugs?: SocketItem[]
  potentialPlugs?: SocketItem[]
  isItemTierSocket?: boolean
}