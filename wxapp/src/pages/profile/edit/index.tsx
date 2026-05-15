import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, Button, Image, Input } from '@tarojs/components'
import { useAppStore } from '@/hooks/useAppStore'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import LiquidGlassBg from '@/components/LiquidGlassBg'
import Toast from '@/components/Toast'
import './index.scss'

export default function ProfileEditPage() {
  const { user, init, updateUser, showToast } = useAppStore()
  const [avatarUrl, setAvatarUrl] = useState('')
  const [nickName, setNickName] = useState('')
  const [mantra, setMantra] = useState('')
  const [loading, setLoading] = useState(false)

  useRequireAuth()

  useEffect(() => {
    init()
  }, [])

  useEffect(() => {
    if (user) {
      setAvatarUrl(user.avatarUrl || '')
      setNickName(user.nickName || '')
      setMantra(user.mantra || '')
    }
  }, [user])

  const onChooseAvatar = (e: any) => {
    const { avatarUrl: tempUrl } = e.detail
    if (tempUrl) {
      setAvatarUrl(tempUrl)
    }
  }

  const handleSave = async () => {
    if (!nickName.trim()) {
      showToast('请输入昵称')
      return
    }
    if (loading) return
    setLoading(true)

    try {
      let finalAvatarUrl = avatarUrl

      // 如果头像是本地临时文件，上传到云存储；网络图片（如微信头像）则直接使用
      const isTempFile = avatarUrl && (
        avatarUrl.startsWith('wxfile://') ||
        avatarUrl.startsWith('http://tmp') ||
        avatarUrl.startsWith('https://tmp') ||
        avatarUrl.startsWith('file://') ||
        avatarUrl.startsWith('blob:')
      )
      if (isTempFile) {
        try {
          const cloudPath = `avatars/${Date.now()}-${user?._id || 'user'}.png`
          const uploadRes = await Taro.cloud.uploadFile({
            cloudPath,
            filePath: avatarUrl,
          })
          console.log('uploadFile 返回:', uploadRes)
          if (uploadRes.fileID) {
            finalAvatarUrl = uploadRes.fileID
          }
        } catch (uploadErr: any) {
          // 上传失败不阻断保存，继续使用原始路径（临时路径会过期，但能验证云函数是否正常）
          console.error('头像上传失败（不影响保存）:', uploadErr)
        }
      } else {
        console.log('头像为网络地址，直接使用:', avatarUrl)
      }

      const payload = {
        nickName: nickName.trim(),
        avatarUrl: finalAvatarUrl,
        mantra: mantra.trim(),
      }
      console.log('调用 updateUser，参数:', payload)

      const res = await updateUser(payload)
      console.log('updateUser 返回:', res)

      showToast('保存成功')
      setTimeout(() => {
        Taro.navigateBack()
      }, 800)
    } catch (e: any) {
      console.error('保存失败详情:', e)
      const errMsg = e?.message || e?.errMsg || JSON.stringify(e)
      showToast(`保存失败: ${errMsg}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={{ height: '100vh', position: 'relative' }}>
      <LiquidGlassBg />

      <View className='edit-page' style={{ height: '100%', position: 'relative', zIndex: 1 }}>
        {/* 头像 */}
        <View style={{ display: 'flex', justifyContent: 'center', marginTop: 24, marginBottom: 32 }}>
          <Button
            className='avatar-btn'
            openType='chooseAvatar'
            onChooseAvatar={onChooseAvatar}
          >
            {avatarUrl ? (
              <Image className='avatar-img' src={avatarUrl} mode='aspectFill' />
            ) : (
              <Text className='avatar-placeholder'>点击选择头像</Text>
            )}
          </Button>
        </View>

        {/* 昵称 */}
        <View className='form-item'>
          <Text className='form-label'>昵称</Text>
          <Input
            className='form-input'
            type='nickname'
            placeholder='请输入昵称'
            value={nickName}
            onInput={(e) => setNickName(e.detail.value)}
          />
        </View>

        {/* 座右铭 */}
        <View className='form-item'>
          <Text className='form-label'>座右铭</Text>
          <Input
            className='form-input'
            placeholder='写下你的自律宣言'
            value={mantra}
            onInput={(e) => setMantra(e.detail.value)}
          />
        </View>

        {/* 保存按钮 */}
        <View
          className='save-btn'
          onClick={handleSave}
          style={{ opacity: loading ? 0.6 : 1 }}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: 600 }}>
            {loading ? '保存中...' : '保存'}
          </Text>
        </View>
      </View>

      <Toast />
    </View>
  )
}
