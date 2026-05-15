import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import Taro from '@tarojs/taro'
import { User, CheckIn, FeedItem, Goals, AddCheckInRequest, WeeklyDay } from '@/types'

interface AppState {
  user: User | null
  isLoggedIn: boolean
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
  login: (params?: { code?: string; nickName?: string; avatarUrl?: string }) => Promise<void>
  logout: () => void
  updateUser: (data: Partial<Pick<User, 'nickName' | 'avatarUrl' | 'mantra'>>) => Promise<void>
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
      isLoggedIn: false,
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
        const { isLoggedIn } = get()
        if (!isLoggedIn) return

        try {
          const { result } = await Taro.cloud.callFunction({ name: 'login', config: { timeout: 8000 } })
          if (result && (result as any).success) {
            set({ user: (result as any).user })
          }
        } catch (e: any) {
          console.error('[init] login 云函数调用失败:', e)
          if (e?.errMsg?.includes('timeout') || e?.message?.includes('timeout')) {
            get().showToast('请求超时：请检查云函数是否已部署')
          }
        }

        try {
          const { result } = await Taro.cloud.callFunction({ name: 'getHomeData', config: { timeout: 8000 } })
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
        } catch (e: any) {
          console.error('[init] getHomeData 云函数调用失败:', e)
          if (e?.errMsg?.includes('timeout') || e?.message?.includes('timeout')) {
            get().showToast('请求超时：请检查云函数是否已部署')
          }
        }
      },

      login: async (userInfo = {}) => {
        try {
          const { result } = await Taro.cloud.callFunction({
            name: 'login',
            data: userInfo,
            config: { timeout: 8000 },
          })
          const res = result as any
          if (res && res.success) {
            set({ user: res.user, isLoggedIn: true })
            try {
              const { result: homeResult } = await Taro.cloud.callFunction({ name: 'getHomeData', config: { timeout: 8000 } })
              const homeRes = homeResult as any
              if (homeRes) {
                set({
                  todayStatus: homeRes.todayStatus,
                  todayCheckIn: homeRes.todayCheckIn,
                  streakDays: homeRes.streakDays,
                  goals: homeRes.goals,
                  weeklyStrip: homeRes.weeklyStrip || [],
                })
              }
            } catch (e: any) {
              console.error('[login] getHomeData 云函数调用失败:', e)
              if (e?.errMsg?.includes('timeout') || e?.message?.includes('timeout')) {
                get().showToast('请求超时：请检查云函数是否已部署')
              }
            }
          } else {
            throw new Error('登录失败')
          }
        } catch (e: any) {
          if (e?.errMsg?.includes('timeout') || e?.message?.includes('timeout')) {
            get().showToast('请求超时：请检查云函数是否已部署')
          }
          throw e
        }
      },

      logout: () => {
        set({
          user: null,
          isLoggedIn: false,
          todayStatus: 'pending',
          todayCheckIn: null,
          streakDays: 0,
          goals: null,
          weeklyStrip: [],
          feed: [],
          feedPage: 1,
          feedHasMore: true,
          toast: null,
        })
        try {
          Taro.clearStorageSync()
        } catch {}
      },

      updateUser: async (data) => {
        const { result } = await Taro.cloud.callFunction({
          name: 'updateUser',
          data,
          config: { timeout: 8000 },
        })
        const res = result as any
        if (res && res.success) {
          set({ user: res.user })
        } else {
          throw new Error(res?.message || '更新失败')
        }
      },

      checkIn: async (data) => {
        const { result } = await Taro.cloud.callFunction({
          name: 'addCheckIn',
          data,
          config: { timeout: 8000 },
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
          config: { timeout: 8000 },
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
        isLoggedIn: state.isLoggedIn,
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
          if (typeof state.isLoggedIn !== 'boolean') state.isLoggedIn = false
        }
      },
    }
  )
)
