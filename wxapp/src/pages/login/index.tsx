import { useState } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, Button, Image } from '@tarojs/components'
import { useAppStore } from '@/hooks/useAppStore'
import logo from '@/assets/logo.png'
import './index.scss'

export default function LoginPage() {
  const { login, showToast } = useAppStore()
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (loading) return
    setLoading(true)
    try {
      const loginRes = await Taro.login()
      await login({ code: loginRes.code })
      showToast('登录成功')
      Taro.switchTab({ url: '/pages/index/index' })
    } catch (err) {
      showToast('登录失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className='login-page'>
      <Image className='login-logo' src={logo} mode='aspectFill' />
      <Text className='login-title'>Aura Check</Text>
      <Text className='login-subtitle'>坚持打卡，养成好习惯</Text>

      <Button
        className='login-btn'
        onClick={handleLogin}
        disabled={loading}
      >
        {loading ? '登录中...' : '微信一键登录'}
      </Button>

      <Text className='login-tip'>登录即表示您同意用户协议和隐私政策</Text>
    </View>
  )
}
