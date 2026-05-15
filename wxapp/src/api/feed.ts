import Taro from '@tarojs/taro'

export async function getFeed(page = 1, pageSize = 10) {
  const { result } = await Taro.cloud.callFunction({
    name: 'getFeed',
    data: { page, pageSize },
  })
  return result as any
}
