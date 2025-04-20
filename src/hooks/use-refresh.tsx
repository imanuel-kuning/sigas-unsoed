import { create } from 'zustand'

type Refresh = {
  watch: number
  refresh: () => void
}

export const useRefresh = create<Refresh>()((set) => ({
  watch: 1,
  refresh: () => set((state) => ({ watch: state.watch + 1 })),
}))
