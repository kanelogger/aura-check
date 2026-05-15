import { View, Text } from '@tarojs/components'
import { EmojiMood } from '@/types'

interface Props {
  value: EmojiMood
  onChange: (m: EmojiMood) => void
}

const moods: EmojiMood[] = [
  { emoji: '💪', label: '充满能量' },
  { emoji: '🔥', label: '热血沸腾' },
  { emoji: '😊', label: '轻松愉快' },
  { emoji: '😤', label: '咬牙坚持' },
  { emoji: '🥳', label: '超额完成' },
  { emoji: '😴', label: '有点疲惫' },
]

export default function MoodPicker({ value, onChange }: Props) {
  return (
    <View style={{ padding: '0 16px', marginTop: 20 }}>
      <Text style={{ fontSize: 14, fontWeight: 600, color: '#5C7A70', marginBottom: 12, display: 'block' }}>
        今天的心情
      </Text>
      <View style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
        {moods.map((mood) => {
          const active = value.label === mood.label
          return (
            <View
              key={mood.label}
              onClick={() => onChange(mood)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                padding: '10px 8px',
                borderRadius: 16,
                width: 70,
                background: active ? 'rgba(78,205,196,0.1)' : 'transparent',
                transform: active ? 'scale(1.05)' : 'scale(1)',
                transition: 'all 0.2s',
              }}
            >
              <Text style={{ fontSize: 28 }}>{mood.emoji}</Text>
              <Text
                style={{
                  fontSize: 12,
                  color: active ? '#4ECDC4' : '#9BB5A8',
                  fontWeight: active ? 600 : 400,
                }}
              >
                {mood.label}
              </Text>
            </View>
          )
        })}
      </View>
    </View>
  )
}
