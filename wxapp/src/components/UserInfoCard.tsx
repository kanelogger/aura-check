import { View, Text } from '@tarojs/components'
import { User } from '@/types'
import Avatar from './Avatar'
import GlassCard from './GlassCard'

interface Props {
  user: User
}

export default function UserInfoCard({ user }: Props) {
  return (
    <GlassCard style={{ margin: '16px', padding: 20 }}>
      <View style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Avatar src={user.avatarUrl} size={64} border='3px solid #A8E6CF' />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: 700, color: '#1A3C34' }}>{user.nickName}</Text>
          {user.mantra ? (
            <Text style={{ fontSize: 13, color: '#5C7A70', marginTop: 4, display: 'block' }}>
              {user.mantra}
            </Text>
          ) : (
            <Text style={{ fontSize: 13, color: '#9BB5A8', marginTop: 4, display: 'block' }}>
              写下你的自律宣言...
            </Text>
          )}
        </View>
      </View>

      <View
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          marginTop: 16,
          paddingTop: 16,
          borderTop: '1px solid rgba(26,60,52,0.06)',
        }}
      >
        <View style={{ textAlign: 'center' }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1A3C34' }}>{user.streakDays}</Text>
          <Text style={{ fontSize: 11, color: '#9BB5A8', marginTop: 2, display: 'block' }}>连续天数</Text>
        </View>
        <View style={{ textAlign: 'center' }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1A3C34' }}>{user.totalCheckIns}</Text>
          <Text style={{ fontSize: 11, color: '#9BB5A8', marginTop: 2, display: 'block' }}>总打卡</Text>
        </View>
        <View style={{ textAlign: 'center' }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1A3C34' }}>{user.monthDone}</Text>
          <Text style={{ fontSize: 11, color: '#9BB5A8', marginTop: 2, display: 'block' }}>本月打卡</Text>
        </View>
      </View>
    </GlassCard>
  )
}
