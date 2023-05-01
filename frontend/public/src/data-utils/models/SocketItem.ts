import { DamageTypeEnum } from "./Enums"

export type SocketItemMeta = {
  manifestDefinition?: any
}

export class SocketItem {
  _meta?: SocketItemMeta
  iconUrl?: string
  name?: string
  socketIndex?: number
  cost?: number
  affinity?: DamageTypeEnum

  constructor(definition: any) {
    this._meta = {
      manifestDefinition: definition
    }
    this.iconUrl = `https://www.bungie.net${definition.displayProperties.icon}`
    this.name = definition.displayProperties.name
    if(definition.plug && definition.plug.energyCost) {
      this.cost = definition.plug.energyCost.energyCost
      this.affinity = definition.plug.energyCost.energyType
    }
  }

  getDescription(): string {
    if(this._meta?.manifestDefinition?.displayProperties?.description) {
      return this._meta?.manifestDefinition?.displayProperties?.description
    }
    return ""
  }
}
