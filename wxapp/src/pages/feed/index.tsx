import { useEffect, useCallback } from 'react'
import { View, ScrollView } from '@tarojs/components'
import { useAppStore } from '@/hooks/useAppStore'
import LiquidGlassBg from '@/components/LiquidGlassBg'
import FeedCard from '@/components/FeedCard'
import Toast from '@/components/Toast'

export default function FeedPage() {
  const { feed, feedHasMore, feedPage, loadFeed } = useAppStore()
  const safeFeed = feed || []

  useEffect(() => {
    if (feed.length === 0) {
      loadFeed(1)
    }
  }, [])

  const handleScrollToLower = useCallback(() => {
    if (feedHasMore) {
      loadFeed(feedPage + 1)
    }
  }, [feedHasMore, feedPage, loadFeed])

  return (
    <View style={{ height: '100vh', position: 'relative' }}>
      <LiquidGlassBg />

      <ScrollView
        scrollY
        style={{ height: '100%', position: 'relative', zIndex: 1 }}
        onScrollToLower={handleScrollToLower}
        lowerThreshold={100}
        className='page-enter'
      >
        <View style={{ paddingTop: 12 }}>
          {safeFeed.map((item, index) => (
            <View key={`${item.checkIn._id || index}`} className='stagger-item'>
              <FeedCard item={item} />
            </View>
          ))}

          {!feedHasMore && safeFeed.length > 0 && (
            <View style={{ textAlign: 'center', padding: 20 }}>
              <View style={{ fontSize: 12, color: '#9BB5A8' }}>没有更多动态了</View>
            </View>
          )}

          {safeFeed.length === 0 && (
            <View style={{ textAlign: 'center', padding: 60 }}>
              <View style={{ fontSize: 40, marginBottom: 12 }}>🌍</View>
              <View style={{ fontSize: 14, color: '#9BB5A8' }}>暂无动态，快去打卡吧</View>
            </View>
          )}
        </View>
      </ScrollView>

      <Toast />
    </View>
  )
}
