export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/login/index',
    'pages/feed/index',
    'pages/stats/index',
    'pages/profile/index',
    'pages/profile/edit/index',
    'pages/checkin/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#F4F9F6',
    navigationBarTitleText: 'Aura Check',
    navigationBarTextStyle: 'black',
    backgroundColor: '#F4F9F6',
  },
  tabBar: {
    color: '#9BB5A8',
    selectedColor: '#1A3C34',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      { pagePath: 'pages/index/index', text: '首页' },
      { pagePath: 'pages/feed/index', text: '动态' },
      { pagePath: 'pages/stats/index', text: '统计' },
      { pagePath: 'pages/profile/index', text: '我的' },
    ],
  },
})
