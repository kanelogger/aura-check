import { View, Text } from '@tarojs/components'
import { useMemo } from 'react'
import { CheckIn } from '@/types'

interface Props {
  checkIns: CheckIn[]
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

export default function CalendarArchive({ checkIns = [] }: Props) {
  if (!checkIns || !Array.isArray(checkIns)) return null

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  const checkInMap = useMemo(() => {
    const map = new Map<string, CheckIn>()
    checkIns.forEach((ci) => {
      if (ci.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)) {
        map.set(ci.date, ci)
      }
    })
    return map
  }, [checkIns, year, month])

  const weekDays = ['日', '一', '二', '三', '四', '五', '六']

  return (
    <View
      className='glass'
      style={{ margin: '0 16px', padding: 16 }}
    >
      <Text style={{ fontSize: 16, fontWeight: 600, color: '#1A3C34', marginBottom: 12, display: 'block' }}>
        {year}年{month + 1}月
      </Text>

      <View style={{ display: 'flex', marginBottom: 8 }}>
        {weekDays.map((d) => (
          <View key={d} style={{ flex: 1, textAlign: 'center' }}>
            <Text style={{ fontSize: 11, color: '#9BB5A8' }}>{d}</Text>
          </View>
        ))}
      </View>

      <View style={{ display: 'flex', flexWrap: 'wrap' }}>
        {Array.from({ length: firstDay }).map((_, i) => (
          <View key={`empty-${i}`} style={{ width: '14.28%', height: 40 }} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const ci = checkInMap.get(dateStr)
          const isToday = dateStr === `${year}-${String(month + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

          return (
            <View
              key={day}
              style={{
                width: '14.28%',
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: ci ? '#A8E6CF' : isToday ? 'rgba(78,205,196,0.15)' : 'transparent',
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    color: ci ? '#1A3C34' : '#5C7A70',
                    fontWeight: isToday ? 700 : 400,
                  }}
                >
                  {day}
                </Text>
              </View>
            </View>
          )
        })}
      </View>
    </View>
  )
}
