const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { code, nickName, avatarUrl } = event

  const { data } = await db.collection('users').where({ openid: OPENID }).get()

  if (data.length > 0) {
    const user = data[0]
    const updateData = {}
    if (nickName) updateData.nickName = nickName
    if (avatarUrl) updateData.avatarUrl = avatarUrl
    updateData.updatedAt = db.serverDate()

    if (Object.keys(updateData).length > 1) {
      await db.collection('users').doc(user._id).update({ data: updateData })
      return { success: true, user: { ...user, ...updateData }, isNewUser: false }
    }
    return { success: true, user, isNewUser: false }
  }

  const newUser = {
    openid: OPENID,
    nickName: nickName || '微信用户',
    avatarUrl: avatarUrl || `https://api.dicebear.com/9.x/avataaars/svg?seed=${OPENID}&size=80`,
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
