const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  const { month } = event

  let query = db.collection('checkins').where({ userId: OPENID })

  if (month) {
    query = db.collection('checkins').where({
      userId: OPENID,
      date: db.command.gte(`${month}-01`).and(db.command.lte(`${month}-31`))
    })
  }

  const { data } = await query.orderBy('date', 'desc').get()

  return {
    success: true,
    list: data
  }
}
