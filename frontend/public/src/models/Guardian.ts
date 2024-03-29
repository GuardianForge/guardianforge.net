import { Enums } from "../data-utils/Main"

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