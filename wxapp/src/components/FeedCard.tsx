import { useState, useRef, useCallback } from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { FeedItem } from '@/types'
import { useAppStore } from '@/hooks/useAppStore'
import Avatar from './Avatar'

interface Props {
  item: FeedItem
}

const DELETE_WIDTH = 80

export default function FeedCard({ item }: Props) {
  const { checkIn, user } = item
  const { user: currentUser, deleteCheckIn, showToast } = useAppStore()
  const isOwner = currentUser?.openid === checkIn.userId

  const [offset, setOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const startXRef = useRef(0)
  const currentOffsetRef = useRef(0)

  const handleTouchStart = useCallback((e: any) => {
    if (!isOwner) return
    startXRef.current = e.touches[0].clientX
    currentOffsetRef.current = offset
    setIsDragging(true)
  }, [isOwner, offset])

  const handleTouchMove = useCallback((e: any) => {
    if (!isDragging || !isOwner) return
    const delta = e.touches[0].clientX - startXRef.current
    let newOffset = currentOffsetRef.current + delta
    newOffset = Math.max(-DELETE_WIDTH, Math.min(0, newOffset))
    setOffset(newOffset)
  }, [isDragging, isOwner])

  const handleTouchEnd = useCallback(() => {
    if (!isOwner) return
    setIsDragging(false)
    setOffset((prev) => (prev < -DELETE_WIDTH / 2 ? -DELETE_WIDTH : 0))
  }, [isOwner])

  const handleDelete = useCallback(() => {
    if (!checkIn._id) return
    Taro.showModal({
      title: '确认删除',
      content: '删除后无法恢复，是否确认？',
      confirmColor: '#FF8A80',
      success: (res) => {
        if (res.confirm) {
          deleteCheckIn(checkIn._id)
            .then((result: any) => {
              if (result?.success) {
                showToast('已删除')
              } else {
                showToast(result?.message || '删除失败')
              }
            })
            .catch(() => showToast('删除失败'))
        }
        setOffset(0)
      },
    })
  }, [checkIn._id, deleteCheckIn, showToast])

  const handleClickContent = useCallback(() => {
    if (offset !== 0) {
      setOffset(0)
    }
  }, [offset])

  return (
    <View style={{ position: 'relative', overflow: 'hidden', margin: '0 16px 12px' }}>
      {/* 删除按钮层 */}
      {isOwner && (
        <View
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: DELETE_WIDTH,
            background: '#FF8A80',
            borderRadius: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 0,
          }}
          onClick={handleDelete}
        >
          <Text style={{ fontSize: 14, color: '#fff', fontWeight: 600 }}>删除</Text>
        </View>
      )}

      {/* 内容层 */}
      <View
        style={{
          transform: `translateX(${offset}px)`,
          transition: isDragging ? 'none' : 'transform 0.25s ease',
          position: 'relative',
          zIndex: 1,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleClickContent}
      >
        <View
          className='glass card-tap'
          style={{ padding: 16, overflow: 'hidden', borderRadius: 20 }}
        >
          <View style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <Avatar src={user.avatarUrl} size={36} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: 600, color: '#1A3C34' }}>{user.nickName}</Text>
              <Text style={{ fontSize: 11, color: '#9BB5A8', marginTop: 2, display: 'block' }}>
                {checkIn.date} · {checkIn.category === 'fitness' ? '健身' : checkIn.category === 'study' ? '学习' : checkIn.category}
              </Text>
            </View>
            <Text style={{ fontSize: 24 }}>{checkIn.emoji}</Text>
          </View>

          {checkIn.note && (
            <Text style={{ fontSize: 14, color: '#5C7A70', lineHeight: '20px', marginBottom: 10, display: 'block' }}>
              {checkIn.note}
            </Text>
          )}

          {checkIn.photoUrl && (
            <Image
              src={checkIn.photoUrl}
              mode='aspectFill'
              style={{ width: '100%', height: 200, borderRadius: 12, marginBottom: 8 }}
            />
          )}
        </View>
      </View>
    </View>
  )
}
