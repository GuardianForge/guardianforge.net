import ActivityOption from "./models/ActivityOption"
import ModalSelectorOption from "./models/ModalSelectorOption"

export const classes: {[key: number]: string} = {
  0: "Titan",
  1: "Hunter",
  2: "Warlock"
}

export const races: {[key: number]: string} = {
  0: "Human",
  1: "Awoken",
  2: "Exo"
}

export const inputStyleOptions: Array<ModalSelectorOption> = [
  {
    iconUrl: "/img/input-icons/mnk.png",
    value: "1",
    display: "Mouse & Keyboard"
  },
  {
    iconUrl: "/img/input-icons/controller.png",
    value: "2",
    display: "Controller"
  }
]

export const activityOptions: Array<ActivityOption> = [
  { value: "1", display: "Any Activity" },
  { value: "100", display: "Crucible", iconUrl: "/img/activities/pvp.png"},
  { value: "101", display: "Trials of Osiris", iconUrl: "/img/activities/trials.png"},
  { value: "102", display: "Competitive", iconUrl: "/img/activities/pvp.png"},

  { value: "200", display: "PvE (General)", iconUrl: "/img/activities/pve.png"},
  { value: "201", display: "Exo Challenge", iconUrl: "/img/activities/exo-challenge.png"},
  { value: "202", display: "Empire Hunts", iconUrl: "/img/activities/empire-hunts.png"},
  { value: "204", display: "Nightmare Hunts", iconUrl: "/img/activities/nightmare-hunts.png"},
  { value: "205", display: "Altars of Sorrow", iconUrl: "/img/activities/altars.png"},

  { value: "210", display: "Nightfalls", iconUrl: "/img/activities/nightfall.png"},

  { value: "230", display: "Dungeons (General)", iconUrl: "/img/activities/dungeons.png"},
  { value: "231", display: "Dungeons // Pit of Heresy", iconUrl: "/img/activities/dungeons.png"},
  { value: "232", display: "Dungeons // Shattered Throne", iconUrl: "/img/activities/dungeons.png"},
  { value: "233", display: "Dungeons // Prophecy", iconUrl: "/img/activities/dungeons.png"},
  { value: "234", display: "Dungeons //  Grasp of Avarice", iconUrl: "/img/activities/dungeons.png"},

  { value: "241", display: "Season 14 // Override", iconUrl: "/img/activities/override.png", isArchived: true},
  { value: "242", display: "Season 14 // Expunge", iconUrl: "/img/activities/expunge.png", isArchived: true},
  { value: "243", display: "Season 13 // Battlegrounds", iconUrl: "/img/activities/battlegrounds.png", isArchived: true},
  { value: "244", display: "Season 12 // Wrathborn Hunts", iconUrl: "/img/activities/wrathborn-hunts.png", isArchived: true},
  { value: "245", display: "Season 16 // Battlegrounds", iconUrl: "/img/activities/battlegrounds-s16.png"},

  { value: "260", display: "Exotic Quests", iconUrl: "/img/activities/exotics.png"},
  { value: "261", display: "Dares of Eternity", iconUrl: "/img/activities/dares.png"},

  { value: "300", display: "Raids (General)", iconUrl: "/img/activities/raids.png"},
  { value: "301", display: "Raid // Vault of Glass", iconUrl: "/img/activities/vog.png"},
  { value: "302", display: "Raid // Deep Stone Crypt", iconUrl: "/img/activities/dsc.png"},
  { value: "303", display: "Raid // Garden of Salvation", iconUrl: "/img/activities/garden.png"},
  { value: "304", display: "Raid // Last Wish", iconUrl: "/img/activities/last-wish.png"},
  { value: "305", display: "Raid // Vow of the Disciple", iconUrl: "/img/activities/vow.png"},

  { value: "400", display: "Gambit", iconUrl: "/img/activities/gambit.png"},
]

export const COMP_STATE = {
  LOADING: 0,
  DONE: 1,
  ERROR: 2,
  SAVING: 3
}