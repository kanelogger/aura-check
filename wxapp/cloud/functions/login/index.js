const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()

  const { data } = await db.collection('users').where({ openid: OPENID }).get()

  if (data.length > 0) {
    return { success: true, user: data[0], isNewUser: false }
  }

  const newUser = {
    openid: OPENID,
    nickName: '微信用户',
    avatarUrl: `https://api.dicebear.com/9.x/avataaars/svg?seed=${OPENID}&size=80`,
    streakDays: 0,
    totalCheckIns: 0,
    weeklyFitnessDone: 0,
    weeklyStudyDone: 0,
    monthDone: 0,
    mantra: '',
    createdAt: db.serverDate(),
    updatedAt: db.serverDate(),
  }

  const { _id } = await db.collection('users').add({ data: newUser })
  return { success: true, user: { ...newUser, _id }, isNewUser: true }
}
