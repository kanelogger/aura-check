import Taro from '@tarojs/taro'

export async function getUserCheckIns(month?: string) {
  const { result } = await Taro.cloud.callFunction({
    name: 'getUserCheckIns',
    data: { month },
    config: { timeout: 8000 },
  })
  return result as any
}

export async function deleteCheckIn(checkInId: string) {
  const { result } = await Taro.cloud.callFunction({
    name: 'deleteCheckIn',
    data: { checkInId },
    config: { timeout: 8000 },
  })
  return result as any
}
