import { Enums } from "@guardianforge/destiny-data-utils"

type Guardian = {
  class: Enums.ClassEnum,
  imgUrl: string,
  id: string

  // Bungie Fields TODO: Put this into DDU
  dateLastPlayed?: string
  characterId?: string
  classType?: string
  raceType?: string
  light?: string
  emblemBackgroundPath?: string
}

export default Guardian