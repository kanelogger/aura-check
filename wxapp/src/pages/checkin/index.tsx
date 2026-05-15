import { useState } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, ScrollView } from '@tarojs/components'
import { useAppStore } from '@/hooks/useAppStore'
import { Category, EmojiMood, CheckInType } from '@/types'
import LiquidGlassBg from '@/components/LiquidGlassBg'
import CategoryPicker from '@/components/CategoryPicker'
import MoodPicker from '@/components/MoodPicker'
import NoteInput from '@/components/NoteInput'
import PhotoUploader from '@/components/PhotoUploader'
import Celebrate from '@/components/Celebrate'
import Toast from '@/components/Toast'

const DEFAULT_MOOD: EmojiMood = { emoji: '💪', label: '充满能量' }

export default function CheckInPage() {
  const { checkIn, showToast } = useAppStore()

  const [category, setCategory] = useState<Category>('fitness')
  const [mood, setMood] = useState<EmojiMood>(DEFAULT_MOOD)
  const [note, setNote] = useState('')
  const [checkInType, setCheckInType] = useState<CheckInType>('text')
  const [photoUrl, setPhotoUrl] = useState('')
  const [celebrate, setCelebrate] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (loading) return
    setLoading(true)

    try {
      const res = await checkIn({
        category,
        emoji: mood.emoji,
        note: note || (category === 'fitness' ? '健身打卡' : '学习打卡'),
        checkInType,
        photoUrl: checkInType === 'photo' ? photoUrl : undefined,
      })

      if (res.success) {
        setCelebrate(true)
        showToast('打卡成功！')
        setTimeout(() => {
          Taro.navigateBack()
        }, 1500)
      } else {
        showToast(res.message || '打卡失败')
      }
    } catch (e) {
      showToast('网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={{ height: '100vh', position: 'relative' }}>
      <LiquidGlassBg />

      <ScrollView
        scrollY
        style={{ height: '100%', position: 'relative', zIndex: 1 }}
        className='page-enter'
      >
        {/* 打卡类型切换 */}
        <View style={{ display: 'flex', gap: 10, padding: '16px' }}>
          {([
            { type: 'text' as CheckInType, label: '文字', emoji: '✏️' },
            { type: 'photo' as CheckInType, label: '图文', emoji: '📸' },
          ]).map((t) => (
            <View
              key={t.type}
              onClick={() => setCheckInType(t.type)}
              style={{
                flex: 1,
                padding: '12px 0',
                borderRadius: 16,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                background: checkInType === t.type ? 'rgba(168,230,207,0.2)' : 'rgba(255,255,255,0.5)',
                border: checkInType === t.type ? '2px solid #4ECDC4' : '2px solid transparent',
              }}
            >
              <Text style={{ fontSize: 20 }}>{t.emoji}</Text>
              <Text style={{ fontSize: 12, color: checkInType === t.type ? '#4ECDC4' : '#5C7A70', fontWeight: 600 }}>
                {t.label}
              </Text>
            </View>
          ))}
        </View>

        <CategoryPicker value={category} onChange={setCategory} />
        <MoodPicker value={mood} onChange={setMood} />

        {checkInType === 'photo' && (
          <View style={{ padding: '0 16px', marginTop: 20 }}>
            <Text style={{ fontSize: 14, fontWeight: 600, color: '#5C7A70', marginBottom: 10, display: 'block' }}>
              上传照片
            </Text>
            <PhotoUploader value={photoUrl} onChange={setPhotoUrl} />
          </View>
        )}

        <NoteInput value={note} onChange={setNote} />

        <View style={{ padding: '24px 16px 40px' }}>
          <View
            onClick={handleSubmit}
            style={{
              width: '100%',
              height: 52,
              borderRadius: 16,
              background: loading ? '#B8CCC4' : '#4ECDC4',
              boxShadow: '0 4px 16px rgba(78,205,196,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 16, color: '#fff', fontWeight: 600 }}>
              {loading ? '提交中...' : '确认打卡'}
            </Text>
          </View>
        </View>
      </ScrollView>

      <Celebrate show={celebrate} />
      <Toast />
    </View>
  )
}
