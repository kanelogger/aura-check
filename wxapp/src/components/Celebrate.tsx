import { View } from '@tarojs/components'
import { useEffect, useState } from 'react'

export default function Celebrate({ show }: { show: boolean }) {
  const [visible, setVisible] = useState(show)

  useEffect(() => {
    if (show) {
      setVisible(true)
      const timer = setTimeout(() => setVisible(false), 1200)
      return () => clearTimeout(timer)
    }
  }, [show])

  if (!visible) return null

  return (
    <View className='celebrate'>
      {Array.from({ length: 12 }).map((_, i) => (
        <View
          key={i}
          className='particle'
          style={{
            background: `hsl(${i * 30}, 80%, 60%)`,
            transform: `rotate(${i * 30}deg)`,
            animationDelay: `${i * 0.02}s`,
            ['--tx' as any]: `${(Math.random() - 0.5) * 300}px`,
            ['--ty' as any]: `${(Math.random() - 0.5) * 300}px`,
          }}
        />
      ))}
    </View>
  )
}
