import { View, Text } from '@tarojs/components'
import { CheckIn } from '@/types'

interface Props {
  checkIns: CheckIn[]
  streakDays: number
  totalCheckIns: number
}

export default function MonthlyStats({ checkIns, streakDays, totalCheckIns }: Props) {
  const fitnessCount = checkIns.filter((c) => c.category === 'fitness').length
  const studyCount = checkIns.filter((c) => c.category === 'study').length

  return (
    <View className='glass' style={{ margin: '12px 16px 0', padding: 16 }}>
      <Text style={{ fontSize: 16, fontWeight: 600, color: '#1A3C34', marginBottom: 12, display: 'block' }}>
        本月概览
      </Text>
      <View style={{ display: 'flex', justifyContent: 'space-around' }}>
        <View style={{ textAlign: 'center' }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#4ECDC4' }}>{totalCheckIns}</Text>
          <Text style={{ fontSize: 11, color: '#9BB5A8', marginTop: 4, display: 'block' }}>总打卡</Text>
        </View>
        <View style={{ textAlign: 'center' }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#FF8A80' }}>{streakDays}</Text>
          <Text style={{ fontSize: 11, color: '#9BB5A8', marginTop: 4, display: 'block' }}>连续天数</Text>
        </View>
        <View style={{ textAlign: 'center' }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#FFD54F' }}>{fitnessCount}</Text>
          <Text style={{ fontSize: 11, color: '#9BB5A8', marginTop: 4, display: 'block' }}>健身</Text>
        </View>
        <View style={{ textAlign: 'center' }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#7C4DFF' }}>{studyCount}</Text>
          <Text style={{ fontSize: 11, color: '#9BB5A8', marginTop: 4, display: 'block' }}>学习</Text>
        </View>
      </View>
    </View>
  )
}
