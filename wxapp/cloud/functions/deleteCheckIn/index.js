const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  const { checkInId } = event

  if (!checkInId) {
    return { success: false, message: '参数错误' }
  }

  try {
    const { data } = await db.collection('checkins').doc(checkInId).get()

    if (!data) {
      return { success: false, message: '记录不存在' }
    }

    if (data.userId !== OPENID) {
      return { success: false, message: '无权删除' }
    }

    await db.collection('checkins').doc(checkInId).remove()

    // 更新用户统计：总打卡数减 1，连续天数等交由前端重新拉取
    const userRes = await db.collection('users').where({ openid: OPENID }).get()
    if (userRes.data.length > 0) {
      const u = userRes.data[0]
      await db.collection('users').doc(u._id).update({
        data: {
          totalCheckIns: _.inc(-1),
          updatedAt: db.serverDate(),
        }
      })
    }

    return { success: true }
  } catch (e) {
    return { success: false, message: e.message || '删除失败' }
  }
}
