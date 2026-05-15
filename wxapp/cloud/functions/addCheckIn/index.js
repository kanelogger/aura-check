const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

function getTodayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  const { category, emoji, note, checkInType, photoUrl } = event

  // 1. 文本安全校验
  if (note) {
    try {
      const secRes = await cloud.openapi.security.msgSecCheck({ content: note })
      if (secRes.result.suggest !== 'pass') {
        return { success: false, message: '内容包含敏感信息' }
      }
    } catch (e) {
      // 继续执行，不阻塞
    }
  }

  const today = getTodayStr()

  // 2. 查今日是否已打卡（同一 category）
  const exist = await db.collection('checkins').where({
    userId: OPENID,
    date: today,
    category
  }).get()

  if (exist.data.length > 0) {
    return { success: false, message: '今日该类别已打卡' }
  }

  // 3. 写入打卡记录
  const checkInData = {
    userId: OPENID,
    category,
    checkInType,
    emoji,
    note,
    photoUrl: photoUrl || '',
    date: today,
    createdAt: db.serverDate(),
  }
  const { _id } = await db.collection('checkins').add({ data: checkInData })

  // 4. 更新用户统计
  const user = await db.collection('users').where({ openid: OPENID }).get()
  const u = user.data[0]

  // 计算连续天数（简化版：只要昨天有打卡就+1，否则重置为1）
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`
  const yCheck = await db.collection('checkins').where({ userId: OPENID, date: yStr }).get()
  const newStreak = yCheck.data.length > 0 ? (u.streakDays || 0) + 1 : 1

  // 周/月统计（简化版，实际应计算本周/本月）
  const weeklyKey = category === 'fitness' ? 'weeklyFitnessDone' : 'weeklyStudyDone'
  const weeklyUpdate = category === 'fitness' || category === 'study'
    ? { [weeklyKey]: _.inc(1) }
    : {}

  await db.collection('users').doc(u._id).update({
    data: {
      streakDays: newStreak,
      totalCheckIns: _.inc(1),
      monthDone: _.inc(1),
      ...weeklyUpdate,
      updatedAt: db.serverDate(),
    }
  })

  return {
    success: true,
    checkIn: { ...checkInData, _id, createdAt: new Date().toISOString() },
    streakDays: newStreak
  }
}
