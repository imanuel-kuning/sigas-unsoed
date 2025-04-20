import { create } from 'zustand'

/* eslint-disable  @typescript-eslint/no-explicit-any */
export type Temporary = {
  temp: any
  setTemp: (temp: any) => void
}

/* eslint-disable  @typescript-eslint/no-explicit-any */
export const useTemporary = create<Temporary>((set) => ({
  temp: {},
  setTemp: (temp: any) => set(() => ({ temp })),
}))
