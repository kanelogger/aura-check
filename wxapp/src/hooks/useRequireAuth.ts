import { useEffect } from 'react'
import Taro from '@tarojs/taro'
import { useAppStore } from './useAppStore'

function isLoginExpired(): boolean {
  try {
    const raw = Taro.getStorageSync('app-storage')
    const parsed = raw ? JSON.parse(raw) : {}
    const isLoggedIn = parsed.state?.isLoggedIn ?? parsed.isLoggedIn
    const expiredAt = parsed.state?.loginExpiredAt ?? parsed.loginExpiredAt
    if (!isLoggedIn || !expiredAt) return true
    return Date.now() > expiredAt
  } catch {
    return true
  }
}

export function useRequireAuth() {
  const isLoggedIn = useAppStore((state) => state.isLoggedIn)

  useEffect(() => {
    const currentPath = Taro.getCurrentInstance()?.router?.path || ''
    if (currentPath === '/pages/login/index') return

    if (!isLoggedIn || isLoginExpired()) {
      Taro.redirectTo({ url: '/pages/login/index' })
    }
  }, [isLoggedIn])
}
