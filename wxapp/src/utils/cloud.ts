import Taro from '@tarojs/taro'

declare const __CLOUD_ENV__: string

export function initCloud() {
  if (!Taro.cloud) {
    console.error('云开发能力不可用')
    return
  }
  const env = typeof __CLOUD_ENV__ !== 'undefined' ? __CLOUD_ENV__ : ''
  Taro.cloud.init({
    env: env || undefined,
    traceUser: true,
  })
}
