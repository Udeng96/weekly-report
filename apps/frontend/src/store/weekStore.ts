import { create } from 'zustand'
import { getWeekKey } from '@/lib/weekUtils'

interface WeekState {
  weekOffset: number
  setWeekOffset: (offset: number) => void
  currentWeekKey: () => string
  nextWeekKey: () => string
}

export const useWeekStore = create<WeekState>()((set, get) => ({
  weekOffset: 0,
  setWeekOffset: (offset) => set({ weekOffset: offset }),
  currentWeekKey: () => getWeekKey(get().weekOffset),
  nextWeekKey: () => getWeekKey(get().weekOffset + 1),
}))
