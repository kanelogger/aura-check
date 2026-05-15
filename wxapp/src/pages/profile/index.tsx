import { useEffect } from 'react'
import { View, ScrollView, Text } from '@tarojs/components'
import { useAppStore } from '@/hooks/useAppStore'
import LiquidGlassBg from '@/components/LiquidGlassBg'
import UserInfoCard from '@/components/UserInfoCard'
import GlassCard from '@/components/GlassCard'
import Toast from '@/components/Toast'

export default function ProfilePage() {
  const { user, init, showToast } = useAppStore()

  useEffect(() => {
    init()
  }, [])

  const settings = [
    { label: '个人资料', emoji: '👤', action: () => showToast('功能开发中') },
    { label: '通知设置', emoji: '🔔', action: () => showToast('功能开发中') },
    { label: '隐私政策', emoji: '🔒', action: () => showToast('功能开发中') },
    { label: '关于我们', emoji: 'ℹ️', action: () => showToast('Aura Check v1.0.0') },
  ]

  return (
    <View style={{ height: '100vh', position: 'relative' }}>
      <LiquidGlassBg />

      <ScrollView
        scrollY
        style={{ height: '100%', position: 'relative', zIndex: 1 }}
        className='page-enter'
      >
        <View style={{ paddingTop: 12 }}>
          {user && <UserInfoCard user={user} />}

          <GlassCard style={{ margin: '0 16px 16px', padding: '8px 0' }}>
            {settings.map((item, index) => (
              <View
                key={item.label}
                onClick={item.action}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '14px 16px',
                  borderBottom: index < settings.length - 1 ? '1px solid rgba(26,60,52,0.06)' : 'none',
                }}
              >
                <Text style={{ fontSize: 18 }}>{item.emoji}</Text>
                <Text style={{ flex: 1, fontSize: 15, color: '#1A3C34' }}>{item.label}</Text>
                <Text style={{ fontSize: 14, color: '#9BB5A8' }}>›</Text>
              </View>
            ))}
          </GlassCard>
        </View>
      </ScrollView>

      <Toast />
    </View>
  )
}
