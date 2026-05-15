import { View, Text, Textarea } from '@tarojs/components'

interface Props {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}

export default function NoteInput({ value, onChange, placeholder = '记录一下今天的打卡内容...' }: Props) {
  return (
    <View style={{ padding: '0 16px', marginTop: 20 }}>
      <Text style={{ fontSize: 14, fontWeight: 600, color: '#5C7A70', marginBottom: 10, display: 'block' }}>
        打卡备注 (可选)
      </Text>
      <Textarea
        value={value}
        onInput={(e) => onChange(e.detail.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          minHeight: 80,
          padding: 12,
          borderRadius: 16,
          background: 'rgba(255,255,255,0.5)',
          border: '1px solid rgba(26,60,52,0.06)',
          fontSize: 14,
          color: '#1A3C34',
          boxSizing: 'border-box',
        }}
        maxlength={200}
      />
    </View>
  )
}
