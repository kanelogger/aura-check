const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event) => {
  const { page = 1, pageSize = 10 } = event

  const { data: checkins } = await db.collection('checkins')
    .orderBy('createdAt', 'desc')
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .get()

  // 关联查询用户信息
  const openIds = [...new Set(checkins.map((c) => c.userId))]
  const { data: users } = await db.collection('users')
    .where({ openid: _.in(openIds) })
    .get()

  const userMap = new Map(users.map((u) => [u.openid, u]))

  const list = checkins.map((c) => ({
    checkIn: c,
    user: {
      nickName: userMap.get(c.userId)?.nickName || '微信用户',
      avatarUrl: userMap.get(c.userId)?.avatarUrl || '',
    }
  }))

  return {
    list,
    hasMore: checkins.length === pageSize
  }
}
