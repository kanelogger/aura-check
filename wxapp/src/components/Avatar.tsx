import { Image } from '@tarojs/components'

interface Props {
  src: string
  size?: number
  border?: string
  className?: string
}

export default function Avatar({ src, size = 40, border, className = '' }: Props) {
  return (
    <Image
      src={src}
      mode='aspectFill'
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        border: border || 'none',
        flexShrink: 0,
      }}
      className={className}
    />
  )
}
