import Taro from '@tarojs/taro'

declare const __CLOUD_ENV__: string

export function initCloud() {
  if (!Taro.cloud) {
    console.error('云开发能力不可用')
    Taro.showModal({
      title: '初始化失败',
      content: '当前基础库不支持云开发，请升级微信/基础库版本',
      showCancel: false,
    })
    return
  }
  const env = typeof __CLOUD_ENV__ !== 'undefined' ? __CLOUD_ENV__ : ''
  if (!env) {
    console.error('未配置云环境 ID，请检查 .env.local 中的 CLOUD_ENV')
    Taro.showModal({
      title: '配置错误',
      content: '未配置云环境 ID，请检查 wxapp/.env.local 中的 CLOUD_ENV',
      showCancel: false,
    })
    return
  }
  try {
    Taro.cloud.init({
      env,
      traceUser: true,
    })
    console.log('[Cloud] 云开发初始化成功，环境:', env)
  } catch (e) {
    console.error('[Cloud] 云开发初始化失败:', e)
  }
}
