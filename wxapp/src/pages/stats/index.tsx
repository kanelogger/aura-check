import { useEffect } from 'react'
import { View, ScrollView } from '@tarojs/components'
import { useAppStore } from '@/hooks/useAppStore'
import LiquidGlassBg from '@/components/LiquidGlassBg'
import CalendarArchive from '@/components/CalendarArchive'
import MonthlyStats from '@/components/MonthlyStats'
import Toast from '@/components/Toast'

export default function StatsPage() {
  const { user, todayCheckIn, streakDays, init } = useAppStore()

  useEffect(() => {
    init()
  }, [])

  // 简化：用 feed 或本地状态模拟月度数据
  const mockCheckIns = todayCheckIn ? [todayCheckIn] : []

  return (
    <View style={{ height: '100vh', position: 'relative' }}>
      <LiquidGlassBg />

      <ScrollView
        scrollY
        style={{ height: '100%', position: 'relative', zIndex: 1 }}
        className='page-enter'
      >
        <View style={{ paddingTop: 12 }}>
          <MonthlyStats
            checkIns={mockCheckIns}
            streakDays={streakDays}
            totalCheckIns={user?.totalCheckIns || 0}
          />
          <CalendarArchive checkIns={mockCheckIns} />
        </View>
      </ScrollView>

      <Toast />
    </View>
  )
}
