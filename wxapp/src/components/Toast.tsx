import { View, Text } from '@tarojs/components'
import { useAppStore } from '@/hooks/useAppStore'

export default function Toast() {
  const toast = useAppStore((s) => s.toast)

  if (!toast || !toast.visible) return null

  return (
    <View className={`toast ${toast.visible ? 'visible' : ''}`}>
      <Text>{toast.message}</Text>
    </View>
  )
}
