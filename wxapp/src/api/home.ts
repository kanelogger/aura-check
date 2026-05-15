import Taro from '@tarojs/taro'

export async function getHomeData() {
  const { result } = await Taro.cloud.callFunction({
    name: 'getHomeData',
  })
  return result as any
}
