import { Router } from 'express'

import socketIoEmitter from 'socket.io-emitter'

import { MegaphoneFactory } from '@/core'
import Interface from '@/plugins/socket-io/interface'
import mysql from '@/plugins/mysql'

const { REDIS_IP, REDIS_PORT } = process.env
const emitter = socketIoEmitter({
  host: REDIS_IP,
  port: REDIS_PORT
})
const megaphoneFactory = new MegaphoneFactory(emitter)
const megaphone = megaphoneFactory.create.bind(megaphoneFactory)

const router = Router()

router.post('/', async (req, res, next) => {
  const {
    userId = '',
    userPw = '',
    roomId = null,
    roomPw = ''
  } = req.body

  const { user } = await mysql.getUserById({ id: userId })
  if (!user) {
    await mysql.signUp({ id: userId, pw: userPw, name: userId })
  }
  res.redirect(`/chat/${userId}/${userPw}/${roomId}/${roomPw}`)
})

router.put('/', async (req, res, next) => {
  const {
    id = null,
    title = '',
    createBy = '',
    pw = '',
    maxJoin = 0,
    description = ''
  } = req.body

  if (id === null) return res.send('id is empty')
  try {
    await mysql.createRoom({ id, title, createBy, pw, maxJoin, description })
    const room = (await mysql.getRoom({ id }))[0]

    megaphone(Interface.Broadcast.Room.CREATE).status(200).send({ room })
    return res.send('success')
  } catch (e) {
    return res.status(403).send('fail')
  }
})

router.delete('/', async (req, res, next) => {
  const { id = null } = req.body
  if (id === null) return res.send('id is empty')
  try {
    await mysql.deleteRoom({ id })

    megaphone(Interface.Broadcast.Room.DELETE).status(200).send({ id })
    return res.send('success')
  } catch (e) {
    return res.status(403).send('fail')
  }
})

export default router
