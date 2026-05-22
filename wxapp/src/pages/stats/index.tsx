import { useEffect } from 'react'
import { View, ScrollView } from '@tarojs/components'
import { useAppStore } from '@/hooks/useAppStore'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import LiquidGlassBg from '@/components/LiquidGlassBg'
import CalendarArchive from '@/components/CalendarArchive'
import MonthlyStats from '@/components/MonthlyStats'
import Toast from '@/components/Toast'

export default function StatsPage() {
  const { user, streakDays, userCheckIns, init, loadUserCheckIns } = useAppStore()

  useEffect(() => {
    init()
    loadUserCheckIns()
  }, [])

  useRequireAuth()

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
            checkIns={userCheckIns}
            streakDays={streakDays}
            totalCheckIns={user?.totalCheckIns || 0}
          />
          <CalendarArchive checkIns={userCheckIns} />
        </View>
      </ScrollView>

      <Toast />
    </View>
  )
}
