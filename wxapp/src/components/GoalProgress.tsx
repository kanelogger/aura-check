import { View, Text } from '@tarojs/components'

interface Props {
  value: number
  max: number
  size?: number
  strokeWidth?: number
  color: string
  label: string
}

export default function GoalProgress({ value, max, size = 72, strokeWidth = 6, color, label }: Props) {
  const pct = Math.min(value / max, 1)
  const r = (size - strokeWidth) / 2
  const c = 2 * Math.PI * r

  return (
    <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <View style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill='none'
            stroke='rgba(26,60,52,0.06)'
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill='none'
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap='round'
            strokeDasharray={c}
            strokeDashoffset={c * (1 - pct)}
            style={{ transition: 'stroke-dashoffset 1.2s ease-out 0.3s' }}
          />
        </svg>
        <View
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1A3C34' }}>
            {value}/{max}
          </Text>
        </View>
      </View>
      <Text style={{ fontSize: 11, color: '#5C7A70', fontWeight: 500 }}>{label}</Text>
    </View>
  )
}
