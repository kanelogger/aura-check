import { View, Text } from '@tarojs/components'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了'
  if (hour < 11) return '早上好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  return '晚上好'
}

function getTodayStr() {
  const d = new Date()
  const weekDays = ['日', '一', '二', '三', '四', '五', '六']
  return `${d.getMonth() + 1}月${d.getDate()}日 周${weekDays[d.getDay()]}`
}

export default function DateGreeting() {
  return (
    <View style={{ padding: '16px' }}>
      <Text style={{ fontSize: 12, color: '#9BB5A8' }}>{getTodayStr()}</Text>
      <Text style={{ fontSize: 22, fontWeight: 700, color: '#1A3C34', marginTop: 4, display: 'block' }}>
        {getGreeting()}，今天也要加油
      </Text>
    </View>
  )
}
