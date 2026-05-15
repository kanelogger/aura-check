import Taro from '@tarojs/taro'

export async function login() {
  const { result } = await Taro.cloud.callFunction({ name: 'login' })
  return result as any
}
