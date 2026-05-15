import { View, Text, Image } from '@tarojs/components'
import { FeedItem } from '@/types'
import Avatar from './Avatar'

interface Props {
  item: FeedItem
}

export default function FeedCard({ item }: Props) {
  const { checkIn, user } = item

  return (
    <View
      className='glass card-tap'
      style={{ margin: '0 16px 12px', padding: 16, overflow: 'hidden' }}
    >
      <View style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <Avatar src={user.avatarUrl} size={36} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: 600, color: '#1A3C34' }}>{user.nickName}</Text>
          <Text style={{ fontSize: 11, color: '#9BB5A8', marginTop: 2, display: 'block' }}>
            {checkIn.date} · {checkIn.category === 'fitness' ? '健身' : checkIn.category === 'study' ? '学习' : checkIn.category}
          </Text>
        </View>
        <Text style={{ fontSize: 24 }}>{checkIn.emoji}</Text>
      </View>

      {checkIn.note && (
        <Text style={{ fontSize: 14, color: '#5C7A70', lineHeight: '20px', marginBottom: 10, display: 'block' }}>
          {checkIn.note}
        </Text>
      )}

      {checkIn.photoUrl && (
        <Image
          src={checkIn.photoUrl}
          mode='aspectFill'
          style={{ width: '100%', height: 200, borderRadius: 12, marginBottom: 8 }}
        />
      )}
    </View>
  )
}
