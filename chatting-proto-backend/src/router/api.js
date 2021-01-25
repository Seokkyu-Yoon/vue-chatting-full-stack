import { Router } from 'express'

import mysql from 'mysql'
import socketIoEmitter from 'socket.io-emitter'

import { ConfigMysql } from '@/config'
import { MegaphoneFactory } from '@/core'
import Interface from '@/plugins/socket-io/interface'

const { REDIS_IP, REDIS_PORT } = process.env
const emitter = socketIoEmitter({
  host: REDIS_IP,
  port: REDIS_PORT
})
const megaphoneFactory = new MegaphoneFactory(emitter)
const megaphone = megaphoneFactory.create.bind(megaphoneFactory)

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

router.post('/room', async (req, res, next) => {
  const {
    roomId,
    userName,
    pw
  } = req.body

  res.redirect(`/chat/${roomId}/${userName}/${pw}`)
})

router.put('/room', async (req, res, next) => {
  const {
    id = null,
    title = '',
    createBy = '',
    pw = '',
    maxJoin = 0,
    description = ''
  } = req.body

  if (id === null) return res.send('id is empty')
  const sqlCreate = `
  INSERT INTO room (id, title, create_by, pw, max_join, description) VALUES
  (${id}, '${title}', '${createBy}', '${pw}', ${maxJoin}, '${description}')
  `
  try {
    await query(sqlCreate)

    const sqlSelect = `
    SELECT room.title, room.create_by AS createBy, room.pw, room.max_join AS maxJoin, room.description, room.last_updated AS lastUpdated, COUNT(participant.room_title) AS joining
    FROM room
    LEFT JOIN participant ON title=room_title
    WHERE title='${title}'
    GROUP BY room.title
    `
    const result = await query(sqlSelect)
    const room = result[0]
    megaphone(Interface.Broadcast.Room.CREATE).status(200).send({ room })
    return res.send('success')
  } catch (e) {
    return res.send('fail')
  }
})

router.delete('/room', async (req, res, next) => {
  const { id = null } = req.body
  if (id === null) return res.send('id is empty')
  const sql = `
  DELETE FROM room WHERE id=${id}
  `
  try {
    await query(sql)
    megaphone(Interface.Broadcast.Room.DELETE).status(200).send({ id })
    return res.send('success')
  } catch (e) {
    return res.send('fail')
  }
})
export default router
