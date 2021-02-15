import mysql from 'mysql'

import { logger } from '@/core'
import { ConfigMysql } from '@/config'
import {
  // for init
  getSelectAllTables,
  getCreateTableRoom,
  getCreateTableUser,
  getCreateTableMessageType,
  getInsertMessageType,
  getCreateTableMessage,
  getCreateTableParticipant,
  getCreateTableRecipient,
  getCreateTableLastJoined,

  // for room
  getSelectCountRoom,
  getSelectRooms,
  getSelectRoom,
  getSelectRoomIdBy,
  getInsertRoom,
  getUpdateRoom,
  getDeleteRoom,

  // for user
  getSelectCountUser,
  getSelectUserId,
  getSelectUserName,
  getSelectUsers,
  getSelectUsersIn,
  getInsertUser,
  getDeleteUserBy,
  getDeleteUserNotIn,

  // for message
  getSelectCountMessage,
  getSelectMessage,
  getSelectInsertedMessage,
  getInsertMessage,

  // for recipient
  getSelectRecipient,
  getInsertRecipient,

  // for participant
  getInsertParticipant,
  getDeleteParticipant,

  // for lastJoined
  getSelectCountLastJoined,
  getInsertLastJoined,
  getUpdateLastJoined
} from './sql-params'

function query ({ sql = '', params = [] }) {
  if (sql === '') return
  const connection = mysql.createConnection(ConfigMysql)
  connection.connect()
  return new Promise((resolve, reject) => {
    connection.query(sql, params, function (err, results) {
      if (err) {
        reject(err)
      } else {
        resolve(results)
      }
      connection.end()
    })
  })
}

async function init () {
  const selectAllTables = getSelectAllTables()

  const allTables = await query(selectAllTables)
  const tables = allTables.reduce((bucket, { tableName }) => {
    return [
      ...bucket,
      tableName
    ]
  }, [])

  if (!tables.includes('room')) {
    const createTableRoom = getCreateTableRoom()
    await query(createTableRoom)
  }

  if (!tables.includes('user')) {
    const createTableUser = getCreateTableUser()
    await query(createTableUser)
  }

  if (!tables.includes('message_type')) {
    const createTableMessageType = getCreateTableMessageType()

    const messageType = {
      text: { idx: 1, type: 'text' }
    }
    const insertMessageTypeText = getInsertMessageType(messageType.text)

    await query(createTableMessageType)
    await query(insertMessageTypeText)
  }

  if (!tables.includes('message')) {
    const createTableMessage = getCreateTableMessage()
    await query(createTableMessage)
  }

  if (!tables.includes('participant')) {
    const createTableParticipant = getCreateTableParticipant()
    await query(createTableParticipant)
  }

  if (!tables.includes('recipient')) {
    const createTableMessage = getCreateTableRecipient()
    await query(createTableMessage)
  }

  if (!tables.includes('last_joined')) {
    const createTableLastJoined = getCreateTableLastJoined()
    await query(createTableLastJoined)
  }
}

async function removeTrashUser (connectingSocketIds) {
  logger.info('cleaning users', connectingSocketIds)
  const deleteUserDisconnected = getDeleteUserNotIn({ connectingSocketIds })
  await query(deleteUserDisconnected)
  logger.info('finished cleaning')
}

async function isValidUser ({ userName = '' }) {
  if (!userName) return { isValid: false }
  const selectCountUserName = getSelectCountUser({ userName })
  const { length } = (await query(selectCountUserName))[0]
  const isValid = length === 0
  return { isValid }
}

async function getUserName ({ id = '' }) {
  if (!id) return { name: '' }
  const selectUserNameById = getSelectUserName({ id })
  const { name } = (await query(selectUserNameById))[0]
  return { name }
}

async function getUsers ({ roomId = null }) {
  const selectUsersInRoomId = roomId === null ? getSelectUsers() : getSelectUsersIn({ roomId })
  const users = await query(selectUsersInRoomId)
  return { users }
}

async function login ({ socketId = '', userName = '', userId = Math.round(Math.random() * 9999999) }) {
  if (!socketId || !userName) throw new Error('Fail to login')
  const { isValid } = await isValidUser({ userName })

  if (!isValid) throw new Error(`'${userName}' is already used`)
  const insertUser = getInsertUser({ id: userId, socketId, name: userName })
  await query(insertUser)

  return {
    isValid,
    userName,
    userId,
    room: {}
  }
}

async function logout ({ socketId = '' }) {
  if (socketId === '') throw new Error('socketId is empty')
  const selectRoomIdsBySocketId = getSelectRoomIdBy({ socketId })
  const result = await query(selectRoomIdsBySocketId)

  const deleteUserBySocketId = getDeleteUserBy({ socketId })
  await query(deleteUserBySocketId)

  const rooms = result.map(({ roomId }) => roomId)
  return { rooms }
}

async function existsRoom ({ id }) {
  const selectCountRoom = getSelectCountRoom({ id })
  const { length } = (await query(selectCountRoom))[0]
  const isExists = length > 0
  return { isExists }
}

async function getRoom ({ id = null }) {
  const { isExists } = await existsRoom({ id })
  if (!isExists) throw new Error(`'${id}' is not exists`)
  const selectRoom = getSelectRoom({ id })
  const room = (await query(selectRoom))[0]
  return { room }
}

async function getRooms ({ startIndex = 0, limit = 0, userId = -1 }) {
  const selectRooms = getSelectRooms({ startIndex, limit, userId })
  const rooms = await query(selectRooms)
  return { rooms }
}

async function createRoom ({
  id = null,
  title = '',
  createBy = '',
  pw = '',
  maxJoin = 0,
  description = ''
}) {
  if (!createBy) {
    throw new Error('createBy is empty to create room')
  }
  let insertId = id
  if (insertId === null) {
    insertId = Math.round(Math.random() * 10000000)
  }

  const { isExists } = await existsRoom({ id: insertId })
  if (isExists) throw new Error('roomId is already exists')
  const insertRoom = getInsertRoom({
    id: insertId,
    title,
    createBy,
    pw,
    maxJoin,
    description
  })
  await query(insertRoom)

  const { room } = await getRoom({ id: insertId })
  return { room }
}

async function updateRoom ({
  id = null,
  title = '',
  pw = '',
  maxJoin = 0,
  description = ''
}) {
  if (id === null) throw new Error('id is empty to update room')

  const updateRoom = getUpdateRoom({ id, title, pw, maxJoin, description })

  await query(updateRoom)

  const { room } = await getRoom({ id })
  return { room }
}

async function deleteRoom ({ id = null }) {
  if (id === null) throw new Error('title is empty to delete room')

  const deleteRoom = getDeleteRoom({ id })
  await query(deleteRoom)
  return { id }
}

async function joinRoom ({ id = null, pw = '', socketId = '' }) {
  if (id === null || !socketId) throw new Error('Invalid to join room')

  const { room } = await getRoom({ id })
  if (room.pw && room.pw !== pw) throw new Error('Invalid to join room')

  if (room.maxJoin !== 0 && room.joining >= room.maxJoin) throw new Error('Room is full')
  const sql = getInsertParticipant({ roomId: id, socketId })
  await query(sql)

  const selectUserId = getSelectUserId({ socketId })

  const { userId } = (await query(selectUserId))[0]
  const countLastJoined = getSelectCountLastJoined({ userId, roomId: id })

  const { length } = (await query(countLastJoined))[0]

  const upsertLastJoined = (
    length > 0
      ? getUpdateLastJoined
      : getInsertLastJoined
  )({ userId, roomId: id })
  await query(upsertLastJoined)

  return { room }
}

async function leaveRoom ({ id = null, socketId = '' }) {
  if (id === null || !socketId) throw new Error('Invalid to leave room')

  const { isExists } = await existsRoom({ id })
  if (!isExists) throw new Error(`id(${id}) room is not exists`)

  const deleteParticipant = getDeleteParticipant({ roomId: id, socketId })
  await query(deleteParticipant)
  return { id }
}

async function getMessages ({ roomId = null, minIndex = -1 }) {
  if (roomId === null) throw new Error('id is empty')
  const COUNT = 50

  let offset = minIndex
  if (minIndex === -1) {
    const countMessage = getSelectCountMessage({ roomId })

    const { length } = (await query(countMessage))[0]
    offset = length
  }
  offset -= COUNT
  let limit = COUNT
  if (offset < 0) {
    limit = COUNT + offset
    offset = 0
  }
  const selectMessage = getSelectMessage({ roomId, limit, offset })

  const results = await query(selectMessage)
  const messages = await Promise.all(results.map(async ({
    idx,
    roomId,
    type,
    writter,
    content,
    datetime
  }) => {
    const selectRecipient = getSelectRecipient({ messageIdx: idx })
    const result = await query(selectRecipient)
    const recipients = result.map(({ userName }) => userName)
    return {
      roomId,
      type,
      writter,
      content,
      datetime,
      recipients
    }
  }))
  return { messages, minIndex: offset }
}

async function getMessageReconnect ({ roomId = null, startIndex = 0 }) {
  if (roomId === null) throw new Error('roomId is empty')
  const limit = Number.MAX_SAFE_INTEGER
  const offset = startIndex
  const selectMessage = getSelectMessage({ roomId, limit, offset })

  const results = await query(selectMessage)
  const messages = await Promise.all(results.map(async ({
    idx,
    roomId,
    type,
    writter,
    content,
    datetime
  }) => {
    const selectRecipient = getSelectRecipient({ messageIdx: idx })
    const result = await query(selectRecipient)
    const recipients = result.map(({ userName }) => userName)
    return {
      roomId,
      type,
      writter,
      content,
      datetime,
      recipients
    }
  }))

  return { messages }
}

async function writeMessage ({
  roomId = null,
  type = '',
  writter = '',
  content = '',
  recipients = []
}) {
  if (roomId === null || !type || !writter || !content) throw new Error('Invalid to write message')

  const insertMessage = getInsertMessage({ roomId, type, writter, content })
  const lastIdxMessage = getSelectInsertedMessage()

  const message = (await query(insertMessage).then(() => query(lastIdxMessage)))[0]

  await Promise.all(recipients.map(async (userName) => {
    const insertRecipient = getInsertRecipient({ messageIdx: message.idx, userName })
    await query(insertRecipient)
  }))

  return {
    message: {
      ...message,
      recipients
    }
  }
}

export default {
  query,

  init,
  removeTrashUser,

  isValidUser,
  getUserName,
  getUsers,
  login,
  logout,

  getRoom,
  getRooms,
  existsRoom,
  createRoom,
  updateRoom,
  deleteRoom,
  joinRoom,
  leaveRoom,

  getMessages,
  getMessageReconnect,
  writeMessage
}
