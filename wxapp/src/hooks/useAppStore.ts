import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import Taro from '@tarojs/taro'
import { User, CheckIn, FeedItem, Goals, AddCheckInRequest, WeeklyDay } from '@/types'

interface AppState {
  user: User | null
  todayStatus: 'checked' | 'pending'
  todayCheckIn: CheckIn | null
  streakDays: number
  feed: FeedItem[]
  goals: Goals | null
  weeklyStrip: WeeklyDay[]
  feedPage: number
  feedHasMore: boolean
  toast: { message: string; visible: boolean } | null

  init: () => Promise<void>
  checkIn: (data: AddCheckInRequest) => Promise<any>
  loadFeed: (page?: number) => Promise<void>
  showToast: (message: string) => void
  hideToast: () => void
}

const taroStorage = {
  getItem: (name: string) => {
    try {
      return Taro.getStorageSync(name)
    } catch {
      return null
    }
  },
  setItem: (name: string, value: string) => {
    try {
      Taro.setStorageSync(name, value)
    } catch {}
  },
  removeItem: (name: string) => {
    try {
      Taro.removeStorageSync(name)
    } catch {}
  },
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      todayStatus: 'pending',
      todayCheckIn: null,
      streakDays: 0,
      feed: [],
      goals: null,
      weeklyStrip: [],
      feedPage: 1,
      feedHasMore: true,
      toast: null,

      init: async () => {
        try {
          const { result } = await Taro.cloud.callFunction({ name: 'login' })
          if (result && (result as any).success) {
            set({ user: (result as any).user })
          }
        } catch (e) {
          console.error('login error', e)
        }

        try {
          const { result } = await Taro.cloud.callFunction({ name: 'getHomeData' })
          const res = result as any
          if (res) {
            set({
              todayStatus: res.todayStatus,
              todayCheckIn: res.todayCheckIn,
              streakDays: res.streakDays,
              goals: res.goals,
              weeklyStrip: res.weeklyStrip || [],
            })
          }
        } catch (e) {
          console.error('getHomeData error', e)
        }
      },

      checkIn: async (data) => {
        const { result } = await Taro.cloud.callFunction({
          name: 'addCheckIn',
          data,
        })
        const res = result as any
        if (res && res.success) {
          const today = new Date()
          const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
          
          set((state) => ({
            todayStatus: 'checked',
            todayCheckIn: res.checkIn,
            streakDays: res.streakDays,
            weeklyStrip: state.weeklyStrip.map(day => 
              day.date === todayStr ? { ...day, status: 'checked', category: data.category } : day
            )
          }))
        }
        return res
      },

      loadFeed: async (page = 1) => {
        const { result } = await Taro.cloud.callFunction({
          name: 'getFeed',
          data: { page, pageSize: 10 },
        })
        const res = result as any
        if (res) {
          set({
            feed: page === 1 ? res.list : [...get().feed, ...res.list],
            feedPage: page,
            feedHasMore: res.hasMore,
          })
        }
      },

      showToast: (message: string) => {
        set({ toast: { message, visible: true } })
        setTimeout(() => {
          set({ toast: null })
        }, 2000)
      },

      hideToast: () => {
        set({ toast: null })
      },
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => taroStorage),
      partialize: (state) => ({
        user: state.user,
        todayStatus: state.todayStatus,
        todayCheckIn: state.todayCheckIn,
        streakDays: state.streakDays,
        goals: state.goals,
        weeklyStrip: state.weeklyStrip,
        feed: state.feed,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (!state.weeklyStrip) state.weeklyStrip = []
          if (!state.feed) state.feed = []
          if (!state.goals) state.goals = null
          if (!state.todayCheckIn) state.todayCheckIn = null
          if (!state.streakDays) state.streakDays = 0
        }
      },
    }
  )
)
