import { View, Text } from '@tarojs/components'
import { Category } from '@/types'

interface Props {
  value: Category
  onChange: (c: Category) => void
}

const categories: { value: Category; label: string; emoji: string; color: string; activeColor: string }[] = [
  { value: 'fitness', label: '健身', emoji: '💪', color: 'rgba(168,230,207,0.15)', activeColor: 'rgba(168,230,207,0.35)' },
  { value: 'study', label: '学习', emoji: '📚', color: 'rgba(255,138,128,0.1)', activeColor: 'rgba(255,138,128,0.25)' },
  { value: 'read', label: '阅读', emoji: '📖', color: 'rgba(255,213,79,0.1)', activeColor: 'rgba(255,213,79,0.3)' },
  { value: 'meditation', label: '冥想', emoji: '🧘', color: 'rgba(124,77,255,0.08)', activeColor: 'rgba(124,77,255,0.2)' },
  { value: 'coding', label: '编程', emoji: '💻', color: 'rgba(78,205,196,0.1)', activeColor: 'rgba(78,205,196,0.25)' },
]

export default function CategoryPicker({ value, onChange }: Props) {
  return (
    <View style={{ padding: '0 16px', marginTop: 16 }}>
      <Text style={{ fontSize: 14, fontWeight: 600, color: '#5C7A70', marginBottom: 12, display: 'block' }}>
        选择类别
      </Text>
      <View style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {categories.map((cat) => {
          const active = value === cat.value
          return (
            <View
              key={cat.value}
              onClick={() => onChange(cat.value)}
              style={{
                flex: '1 1 28%',
                minWidth: 80,
                padding: '12px 0',
                borderRadius: 16,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                background: active ? cat.activeColor : cat.color,
                border: active ? `2px solid ${cat.activeColor.replace('0.35', '0.6')}` : '2px solid transparent',
              }}
            >
              <Text style={{ fontSize: 22 }}>{cat.emoji}</Text>
              <Text style={{ fontSize: 13, color: active ? '#1A3C34' : '#5C7A70', fontWeight: active ? 600 : 400 }}>
                {cat.label}
              </Text>
            </View>
          )
        })}
      </View>
    </View>
  )
}
