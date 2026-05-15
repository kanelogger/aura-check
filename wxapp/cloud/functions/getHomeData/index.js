const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

function getTodayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getPast7Days() {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`)
  }
  return days
}

exports.main = async () => {
  const { OPENID } = cloud.getWXContext()

  const today = getTodayStr()
  const days = getPast7Days()

  // 1. 今日打卡状态
  const todayRes = await db.collection('checkins').where({
    userId: OPENID,
    date: today
  }).get()

  // 2. 过去 7 天打卡
  const weekRes = await db.collection('checkins').where({
    userId: OPENID,
    date: db.command.in(days)
  }).get()

  const weekMap = new Map(weekRes.data.map((d) => [d.date, d]))
  const weeklyStrip = days.map(date => ({
    date,
    status: weekMap.has(date) ? 'checked' : 'pending',
    category: weekMap.get(date)?.category
  }))

  // 3. 用户信息
  const userRes = await db.collection('users').where({ openid: OPENID }).get()
  const u = userRes.data[0] || {}

  return {
    todayStatus: todayRes.data.length > 0 ? 'checked' : 'pending',
    todayCheckIn: todayRes.data[0] || null,
    weeklyStrip,
    streakDays: u.streakDays || 0,
    goals: {
      weeklyFitnessDone: u.weeklyFitnessDone || 0,
      weeklyFitnessTarget: 4,
      weeklyStudyDone: u.weeklyStudyDone || 0,
      weeklyStudyTarget: 5,
      monthDone: u.monthDone || 0,
      monthTarget: 20,
    }
  }
}
