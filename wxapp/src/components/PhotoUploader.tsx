import { useState } from 'react'
import Taro from '@tarojs/taro'
import { View, Image, Text } from '@tarojs/components'

interface Props {
  value?: string
  onChange: (fileID: string) => void
}

export default function PhotoUploader({ value, onChange }: Props) {
  const [preview, setPreview] = useState(value || '')

  const handleChoose = async () => {
    try {
      const res = await Taro.chooseMedia({
        count: 1,
        mediaType: ['image'],
        sourceType: ['album', 'camera'],
      })
      const tempPath = res.tempFiles[0].tempFilePath
      setPreview(tempPath)

      const uploadRes = await Taro.cloud.uploadFile({
        cloudPath: `checkins/${Date.now()}.jpg`,
        filePath: tempPath,
      })

      onChange(uploadRes.fileID)
      setPreview(uploadRes.fileID)
    } catch (e) {
      console.error('upload error', e)
      Taro.showToast({ title: '上传失败', icon: 'none' })
    }
  }

  return (
    <View
      onClick={handleChoose}
      style={{
        width: '100%',
        height: 160,
        borderRadius: 16,
        border: '2px dashed rgba(26,60,52,0.08)',
        background: 'rgba(255,255,255,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {preview ? (
        <Image src={preview} mode='aspectFill' style={{ width: '100%', height: '100%' }} />
      ) : (
        <View style={{ textAlign: 'center' }}>
          <Text style={{ fontSize: 28, display: 'block' }}>+</Text>
          <Text style={{ fontSize: 13, color: '#9BB5A8', marginTop: 4, display: 'block' }}>添加图片</Text>
        </View>
      )}
    </View>
  )
}
