import { View, Text, ScrollView } from '@tarojs/components'
import { WeeklyDay } from '@/types'

interface Props {
  days: WeeklyDay[]
}

const weekNames = ['日', '一', '二', '三', '四', '五', '六']

function parseDate(dateStr: string) {
  const d = new Date(dateStr)
  return {
    dayName: weekNames[d.getDay()],
    dayOfMonth: d.getDate(),
    isToday: dateStr === getTodayStr(),
  }
}

function getTodayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function filterAroundToday(days: WeeklyDay[]): WeeklyDay[] {
  const todayStr = getTodayStr()
  const todayIndex = days.findIndex((d) => d.date === todayStr)
  if (todayIndex === -1) return days.slice(0, 5)
  const start = Math.max(0, todayIndex - 2)
  const end = Math.min(days.length, todayIndex + 3)
  return days.slice(start, end)
}

export default function WeeklyStrip({ days = [] }: Props) {
  if (!days || !Array.isArray(days)) return null

  const displayDays = filterAroundToday(days)

  return (
    <ScrollView scrollX style={{ whiteSpace: 'nowrap', padding: '12px 16px' }}>
      {displayDays.map((day) => {
        const info = parseDate(day.date)
        const isChecked = day.status === 'checked'
        return (
          <View
            key={day.date}
            style={{
              display: 'inline-flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: 48,
              marginRight: 8,
            }}
          >
            <Text style={{ fontSize: 10, color: '#9BB5A8', marginBottom: 4 }}>
              周{info.dayName}
            </Text>
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: info.isToday ? '#4ECDC4' : isChecked ? 'rgba(168,230,207,0.2)' : 'transparent',
                boxShadow: info.isToday ? '0 2px 8px rgba(78,205,196,0.3)' : 'none',
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  color: info.isToday ? '#fff' : '#5C7A70',
                  fontWeight: info.isToday ? 700 : 400,
                }}
              >
                {info.dayOfMonth}
              </Text>
            </View>
            {isChecked && (
              <View
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: 2,
                  background: '#A8E6CF',
                  marginTop: 4,
                }}
              />
            )}
          </View>
        )
      })}
    </ScrollView>
  )
}
