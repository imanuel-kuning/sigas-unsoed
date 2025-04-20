import { create } from 'zustand'

type Location = {
  province: string
  currentLocation: (province: string) => void
}

export const useLocation = create<Location>()((set) => ({
  province: '',
  currentLocation: (province) => set(() => ({ province })),
}))
