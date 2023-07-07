import { create } from 'zustand'

interface HighlightState {
  highlights: string[]
  setHighlights: (highlights: string[]) => void
  updateHighlights: (key: string) => void
  resetHighlightState: () => void
}

export const useHighlightsStore = create<HighlightState>((set, get) => ({
  highlights: [],
  resetHighlightState: () => set(() => ({highlights: []})),
  setHighlights: (highlights: string[]) => set(() => ({highlights})),
  updateHighlights: (key: string) => {
    const { highlights } = get()
    let _highlights = highlights
    if(_highlights.find(el => el === key)) {
      _highlights = _highlights.filter(el => el !== key)
    } else {
      _highlights.push(key)
    }
    set({
      highlights: _highlights
    })
  }
}))