import { useEffect } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, ScrollView } from '@tarojs/components'
import { useAppStore } from '@/hooks/useAppStore'
import LiquidGlassBg from '@/components/LiquidGlassBg'
import DateGreeting from '@/components/DateGreeting'
import WeeklyStrip from '@/components/WeeklyStrip'
import GoalProgress from '@/components/GoalProgress'
import GlassCard from '@/components/GlassCard'
import Toast from '@/components/Toast'

export default function HomePage() {
  const {
    user,
    todayStatus,
    streakDays,
    goals,
    weeklyStrip,
    init,
  } = useAppStore()

  useEffect(() => {
    init()
  }, [])

  const handleCheckIn = () => {
    Taro.navigateTo({ url: '/pages/checkin/index' })
  }

  return (
    <View style={{ height: '100vh', position: 'relative' }}>
      <LiquidGlassBg />

      <ScrollView
        scrollY
        style={{ height: '100%', position: 'relative', zIndex: 1 }}
        className='page-enter'
      >
        <DateGreeting />

        {/* 目标进度 */}
        {goals && (
          <GlassCard style={{ margin: '0 16px 12px', padding: 16 }}>
            <Text style={{ fontSize: 15, fontWeight: 600, color: '#1A3C34', marginBottom: 16, display: 'block' }}>
              本周目标
            </Text>
            <View style={{ display: 'flex', justifyContent: 'space-around' }}>
              <GoalProgress
                value={goals.weeklyFitnessDone}
                max={goals.weeklyFitnessTarget}
                color='#FF8A80'
                label='本周健身'
              />
              <GoalProgress
                value={goals.weeklyStudyDone}
                max={goals.weeklyStudyTarget}
                color='#4ECDC4'
                label='本周学习'
              />
              <GoalProgress
                value={goals.monthDone}
                max={goals.monthTarget}
                color='#FFD54F'
                label='本月打卡'
              />
            </View>
          </GlassCard>
        )}

        {/* 周打卡条 */}
        <GlassCard style={{ margin: '0 16px 12px', padding: '8px 0' }}>
          <WeeklyStrip days={weeklyStrip} />
        </GlassCard>

        {/* 今日状态 */}
        <GlassCard style={{ margin: '0 16px 12px', padding: 16 }}>
          {todayStatus === 'pending' ? (
            <View style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: 600, color: '#1A3C34' }}>
                  今天还没打卡
                </Text>
                <Text style={{ fontSize: 12, color: '#9BB5A8', marginTop: 4, display: 'block' }}>
                  坚持打卡，养成好习惯
                </Text>
              </View>
              <View
                onClick={handleCheckIn}
                style={{
                  padding: '10px 20px',
                  borderRadius: 16,
                  background: '#4ECDC4',
                  boxShadow: '0 4px 12px rgba(78,205,196,0.3)',
                }}
              >
                <Text style={{ fontSize: 14, color: '#fff', fontWeight: 600 }}>去打卡</Text>
              </View>
            </View>
          ) : (
            <View>
              <View style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Text style={{ fontSize: 28 }}>🔥</Text>
                <View>
                  <Text style={{ fontSize: 15, fontWeight: 600, color: '#1A3C34' }}>
                    今日已打卡
                  </Text>
                  <Text style={{ fontSize: 12, color: '#9BB5A8', marginTop: 2, display: 'block' }}>
                    连续 {streakDays} 天
                  </Text>
                </View>
              </View>
            </View>
          )}
        </GlassCard>

        {/* 快捷入口 */}
        <View style={{ display: 'flex', gap: 10, padding: '0 16px', marginBottom: 12 }}>
          {[
            { label: '打卡', emoji: '✏️', path: '/pages/checkin/index', color: '#4ECDC4', bg: 'rgba(168,230,207,0.15)' },
            { label: '动态', emoji: '🌍', path: '/pages/feed/index', color: '#7C4DFF', bg: 'rgba(124,77,255,0.08)' },
            { label: '统计', emoji: '📊', path: '/pages/stats/index', color: '#FF8A80', bg: 'rgba(255,138,128,0.08)' },
          ].map((item) => (
            <View
              key={item.label}
              onClick={() => {
                if (item.path === '/pages/checkin/index') {
                  Taro.navigateTo({ url: item.path })
                } else {
                  Taro.switchTab({ url: item.path })
                }
              }}
              style={{
                flex: 1,
                padding: '14px 0',
                borderRadius: 16,
                background: item.bg,
                border: '1px solid rgba(255,255,255,0.6)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Text style={{ fontSize: 22 }}>{item.emoji}</Text>
              <Text style={{ fontSize: 12, color: item.color, fontWeight: 600 }}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* 连续天数卡片 */}
        <View style={{ display: 'flex', gap: 10, padding: '0 16px', marginBottom: 24 }}>
          <GlassCard style={{ flex: 1, padding: 16, textAlign: 'center' }}>
            <Text style={{ fontSize: 28 }}>🔥</Text>
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#4ECDC4', marginTop: 4, display: 'block' }}>
              {streakDays}
            </Text>
            <Text style={{ fontSize: 11, color: '#9BB5A8', marginTop: 4, display: 'block' }}>连续天数</Text>
          </GlassCard>
          <GlassCard style={{ flex: 1, padding: 16, textAlign: 'center' }}>
            <Text style={{ fontSize: 28 }}>✨</Text>
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#FFD54F', marginTop: 4, display: 'block' }}>
              {user?.totalCheckIns || 0}
            </Text>
            <Text style={{ fontSize: 11, color: '#9BB5A8', marginTop: 4, display: 'block' }}>总打卡</Text>
          </GlassCard>
        </View>
      </ScrollView>

      <Toast />
    </View>
  )
}
