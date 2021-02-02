import { Router } from 'express'

import mysql from 'mysql'
import { ConfigMysql } from '@/config'

function query (sql = '') {
  const connection = mysql.createConnection(ConfigMysql)
  connection.connect()
  return new Promise((resolve, reject) => {
    connection.query(sql, function (err, results) {
      if (err) {
        reject(err)
      } else {
        resolve(results)
      }
      connection.end()
    })
  })
}

const router = Router()

router.get('/', async (req, res, next) => {
  const {
    roomId = null
  } = req.query

  const sqlBase = `
  SELECT participant.room_id AS roomId, participant.user_id AS userId, user.name
  FROM participant
  LEFT JOIN user ON user.id = participant.user_id
  `
  const sql = roomId === null
    ? sqlBase
    : `
  ${sqlBase}
  WHERE participant.room_id = ${roomId}
  `
  const result = await query(sql)
  res.send(result)
})

export default router
