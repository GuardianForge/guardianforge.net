import { create } from 'zustand'

interface CreateBuildState {
  isHighlightModeOn: boolean
  setHighlightMode: (isOn: boolean) => void
  resetCreateBuildState: () => void
}

export const useCreateBuildStore = create<CreateBuildState>((set, get) => ({
  isHighlightModeOn: false,
  setHighlightMode: (isOn: boolean) => set(() => ({ isHighlightModeOn: isOn })),
  resetCreateBuildState: () => {
    set({
      isHighlightModeOn: false
    })
  }
}))

// interface CreateBuildState {
//   isEditingProfile: boolean,
//   setEditing: Function,
// }

// export const useEditProfileStore = create<CreateBuildState>((set) => ({
//   isEditingProfile: false,
//   setEditing: (isEditing: boolean) => set(() => ({ 
//     isEditingProfile: isEditing
//   }))
// }))
