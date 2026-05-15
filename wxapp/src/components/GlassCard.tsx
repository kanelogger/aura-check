import { View } from '@tarojs/components'
import { PropsWithChildren } from 'react'

interface Props {
  className?: string
  style?: React.CSSProperties
}

export default function GlassCard({ children, className = '', style }: PropsWithChildren<Props>) {
  return (
    <View className={`glass ${className}`} style={style}>
      {children}
    </View>
  )
}
