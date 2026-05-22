import { useLaunch } from '@tarojs/taro'
import Taro from '@tarojs/taro'
import { initCloud } from './utils/cloud'
import './app.scss'

function App({ children }: { children: React.ReactNode }) {
  useLaunch(() => {
    initCloud()

    try {
      const raw = Taro.getStorageSync('app-storage')
      const parsed = raw ? JSON.parse(raw) : {}
      const isLoggedIn = parsed.state?.isLoggedIn || parsed.isLoggedIn
      const expiredAt = parsed.state?.loginExpiredAt || parsed.loginExpiredAt
      const now = Date.now()

      if (!isLoggedIn || !expiredAt || now > expiredAt) {
        // 过期或未登录，清除存储并跳转登录页
        Taro.removeStorageSync('app-storage')
        Taro.redirectTo({ url: '/pages/login/index' })
      }
    } catch {
      Taro.redirectTo({ url: '/pages/login/index' })
    }
  })

  return children
}

export default App
