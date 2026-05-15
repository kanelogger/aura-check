const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { nickName, avatarUrl, mantra } = event

  const { data } = await db.collection('users').where({ openid: OPENID }).get()

  if (data.length === 0) {
    return { success: false, message: '用户不存在' }
  }

  const user = data[0]
  const updateData = {}
  if (nickName !== undefined) updateData.nickName = nickName
  if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl
  if (mantra !== undefined) updateData.mantra = mantra
  updateData.updatedAt = db.serverDate()

  await db.collection('users').doc(user._id).update({ data: updateData })

  const { data: updatedData } = await db.collection('users').doc(user._id).get()
  return { success: true, user: updatedData }
}
