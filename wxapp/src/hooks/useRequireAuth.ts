import { useEffect } from 'react'
import Taro from '@tarojs/taro'
import { useAppStore } from './useAppStore'

export function useRequireAuth() {
  const isLoggedIn = useAppStore((state) => state.isLoggedIn)

  useEffect(() => {
    const currentPath = Taro.getCurrentInstance()?.router?.path || ''
    if (currentPath === '/pages/login/index') return

    // 先同步读取 storage，避免 zustand persist 恢复延迟导致误判
    try {
      const raw = Taro.getStorageSync('app-storage')
      const parsed = raw ? JSON.parse(raw) : {}
      if (parsed.isLoggedIn) return
    } catch {}

    if (!isLoggedIn) {
      Taro.redirectTo({ url: '/pages/login/index' })
    }
  }, [isLoggedIn])
}
