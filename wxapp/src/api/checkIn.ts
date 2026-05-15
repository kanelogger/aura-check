import Taro from '@tarojs/taro'
import { AddCheckInRequest } from '@/types'

export async function addCheckIn(data: AddCheckInRequest) {
  const { result } = await Taro.cloud.callFunction({
    name: 'addCheckIn',
    data,
  })
  return result as any
}
