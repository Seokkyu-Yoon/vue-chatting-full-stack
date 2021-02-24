import Connection from './connection'
import logger from '@/core/logger'

import {
  // for init
  getSelectAllTables,
  getCreateTableOnline,
  getCreateTableRoom,
  getCreateTableUser,
  getCreateTableMember,
  getCreateTableMessageType,
  getInsertMessageType,
  getCreateTableMessage,
  getCreateTableDirectMessage,
  getCreateTableRoomMessage,
  getCreateTableGroupMessage,
  getSelectOfflineUsers,
  getSelectUserBySocketId,
  getSelectOnlineMembersInRoom,
  getSelectUserById,
  getSelectUserIsValid,
  getInsertOnlineUser,
  getDeleteOnlineUser,
  getInsertUser,
  getSelectCountUser,
  getSelectRooms,
  getSelectUserAlreadyOnline,
  getSelectRoom,
  getInsertMember,
  getSelectMember,
  getInsertRoom,
  getSelectLastInsertId,
  getUpdateMemberOffline,
  getSelectRoomsJoined,
  getDeleteRoom,
  getSelectRoomsByTitle,
  getSelectMessagesInRoom,
  getSelectCountMessageInRoom,
  getSelectMessageRecipients,
  getUpdateMember,
  getSelectMemberJoining,
  getInsertMessage,
  getSetId,
  getInsertGroupMessages,
  getInsertRoomMessage,
  getSelectMessage,
  getUpdateRoom,
  getSelectMessagesInRoomReconnect
} from './sql-params'

const TABLE_CREATE_MAP = {
  online: getCreateTableOnline(),
  user: getCreateTableUser(),
  room: getCreateTableRoom(),
  message_type: getCreateTableMessageType(),
  message: getCreateTableMessage(),
  member: getCreateTableMember(),
  direct_message: getCreateTableDirectMessage(),
  room_message: getCreateTableRoomMessage(),
  group_message: getCreateTableGroupMessage()
}

const MESSAGE_TYPE = [
  { id: 1, type: 'text' }
]

async function exec (sqlParamsSet) {
  const connection = new Connection()
  const result = await connection.query(sqlParamsSet)
  return result
}

async function transaction (sqlParamsSets) {
  const connection = new Connection()
  const results = await connection.transaction(sqlParamsSets)
  return results
}

async function init () {
  const selectAllTables = getSelectAllTables()
  const mysqlTables = await exec(selectAllTables)
  for (const tableCreateKey in TABLE_CREATE_MAP) {
    const isExists = mysqlTables.some(({ tableName }) => tableName === tableCreateKey)
    if (isExists) {
      logger.info(`${tableCreateKey} already exists`)
      continue
    }
    const sqlParamsSetCreateTable = TABLE_CREATE_MAP[tableCreateKey]
    await exec(sqlParamsSetCreateTable)
    logger.info(`${tableCreateKey} create done`)

    if (tableCreateKey !== 'message_type') continue

    const sqlParamsSetsMessageTypes = MESSAGE_TYPE.map((typePayload) => getInsertMessageType(typePayload))
    await transaction(sqlParamsSetsMessageTypes)
    logger.info('insert message types done')
  }
}

async function removeOfflineUser (connectingSocketIds = []) {
  logger.info('cleaning remaining offline users in online', connectingSocketIds)

  const selectOfflineUsers = getSelectOfflineUsers({ connectingSocketIds })
  const offlineUsers = await exec(selectOfflineUsers)
  const offlines = await Promise.all(offlineUsers.map(signOut))
  logger.info('finished cleaning offline users in online')
  return { offlines }
}

async function getUserBySocketId ({ socketId = '' }) {
  if (!socketId) return {}
  const selectUserBySocketId = getSelectUserBySocketId({ socketId })
  const user = (await exec(selectUserBySocketId))[0]
  return { user }
}

async function getUserById ({ id = '' }) {
  if (!id) return {}
  const selectUserById = getSelectUserById({ id })
  const user = (await exec(selectUserById))[0]
  return { user }
}

async function signIn ({ socketId = '', id = '', pw = '' }) {
  const selectUserIsValid = getSelectUserIsValid({ id, pw })
  const user = (await exec(selectUserIsValid))[0] || null
  if (user === null) throw new Error('아이디와 비밀번호를 확인해주세요')

  const selectUserAlreadyOnline = getSelectUserAlreadyOnline({ socketId, userId: id })
  const isOnline = (await exec(selectUserAlreadyOnline))[0].length > 0

  if (!isOnline) {
    const insertOnlineUser = getInsertOnlineUser({ socketId, userId: id })
    await exec(insertOnlineUser)
  }
  return { user }
}

async function signUp ({ id, pw, name, email, phone }) {
  const selectCountUser = getSelectCountUser({ id })
  const { length } = (await exec(selectCountUser))[0]
  if (length > 0) throw new Error('이미 존재하는 아이디입니다')

  const insertUser = getInsertUser({ id, pw, name, email, phone })
  await exec(insertUser)
  return await getUserById({ id })
}

async function signOut ({ socketId = '' }) {
  const selectUserBySocketId = getSelectUserBySocketId({ socketId })
  const user = (await exec(selectUserBySocketId))[0]

  const deleteOnlineUser = getDeleteOnlineUser({ socketId })
  await exec(deleteOnlineUser)

  const selectMemberJoining = getSelectMemberJoining({ userId: user.id })
  const rooms = (await exec(selectMemberJoining)).map(({ roomId }) => roomId)

  const updateMemberOffline = getUpdateMemberOffline({ userId: user.id })
  await exec(updateMemberOffline)

  return { user, rooms }
}

async function getRooms ({ startIndex = 0, limit = 0 }) {
  const selectRooms = getSelectRooms({ startIndex, limit })
  const rooms = await exec(selectRooms)
  return { rooms }
}

async function getRoomsJoined ({ userId = '' }) {
  const selectRoomsJoined = getSelectRoomsJoined({ userId })
  const rooms = await exec(selectRoomsJoined)
  return { rooms }
}

async function getRoomsSearched ({ title = '' }) {
  const selectRoomsSearched = getSelectRoomsByTitle({ title })
  const rooms = await exec(selectRoomsSearched)
  return { rooms }
}
async function createRoom ({ title, createBy, pw, maxJoin, description }) {
  const insertRoom = getInsertRoom({ createBy, title, pw, maxJoin, description })
  const selectLastInsertId = getSelectLastInsertId()
  const resultLastInsertId = (await transaction([insertRoom, selectLastInsertId]))[1]
  const { id } = resultLastInsertId[0]

  const selectRoom = getSelectRoom({ id })
  const room = (await exec(selectRoom))[0] || null
  return { room }
}

async function updateRoom ({ id, title, pw, maxJoin, description }) {
  const updateRoom = getUpdateRoom({ id, title, pw, maxJoin, description })
  await exec(updateRoom)

  const selectRoom = getSelectRoom({ id })
  const room = (await exec(selectRoom))[0] || null
  return { room }
}

async function deleteRoom ({ id = -1 }) {
  // is exists
  const selectRoom = getSelectRoom({ id })
  const room = (await exec(selectRoom))[0] || null
  if (room === null) throw new Error('존재하지 않는 방입니다')

  const deleteRoom = getDeleteRoom({ id })
  await exec(deleteRoom)
  return { id }
}

async function joinRoom ({ id = -1, pw = '', userId = '' }) {
  // is exists
  const selectRoom = getSelectRoom({ id })
  const room = (await exec(selectRoom))[0] || null
  if (room === null) throw new Error('존재하지 않는 방입니다')

  // is already member
  const selectMemebr = getSelectMember({ roomId: id })
  const members = await exec(selectMemebr)
  if (members.some(({ userId: memberId }) => memberId === userId)) {
    const updateMember = getUpdateMember({ userId, roomId: id, joining: true })
    await exec(updateMember)
    return { room }
  }

  // password mismatch
  if (room.pw !== pw) throw new Error('비밀번호가 틀렸습니다')

  // insert member
  const insertMember = getInsertMember({ userId, roomId: id })
  await exec(insertMember)
  return { room }
}

async function leaveRoom ({ id = -1, userId = '' }) {
  // is exists
  const selectRoom = getSelectRoom({ id })
  const room = (await exec(selectRoom))[0] || null
  if (room === null) throw new Error('존재하지 않는 방입니다')

  const updateMember = getUpdateMember({ userId, roomId: id, joining: false })
  await exec(updateMember)
  return { roomId: room.id }
}

async function getOnlineMembersInRoom ({ roomId = null }) {
  if (roomId === null) return { users: [] }
  const selectOnlineMembersInRoom = getSelectOnlineMembersInRoom({ roomId })
  const users = await exec(selectOnlineMembersInRoom)
  return { users }
}

async function getMessagesInRoom ({ userId = '', roomId = null, minIndex = -1 }) {
  if (roomId === null) throw new Error('id is empty')
  const COUNT = 50

  let offset = minIndex
  if (minIndex === -1) {
    const countMessage = getSelectCountMessageInRoom({ userId, roomId })
    const { length } = (await exec(countMessage))[0]
    offset = length
  }
  offset -= COUNT
  let limit = COUNT
  if (offset < 0) {
    limit = COUNT + offset
    offset = 0
  }
  const selectMessagesInRoom = getSelectMessagesInRoom({ userId, roomId, offset, limit })
  const messagesInRoom = await exec(selectMessagesInRoom)
  const messages = await Promise.all(messagesInRoom.map(async (message) => {
    const selectMessageRecipients = getSelectMessageRecipients({ messageId: message.id })
    const recipients = (await exec(selectMessageRecipients)).map(({ userId }) => userId)
    return {
      ...message,
      roomId,
      recipients
    }
  }))
  return { messages, minIndex: offset }
}

async function getMessagesInRoomReconnect ({ userId = '', roomId = null, startIndex = 0 }) {
  if (roomId === null) throw new Error('id is empty')
  const selectMessagesInRoomReconnect = getSelectMessagesInRoomReconnect({ userId, roomId, startIndex })
  const messagesInRoom = await exec(selectMessagesInRoomReconnect)
  const messages = await Promise.all(messagesInRoom.map(async (message) => {
    const selectMessageRecipients = getSelectMessageRecipients({ messageId: message.id })
    const recipients = (await exec(selectMessageRecipients)).map(({ userId }) => userId)
    return {
      ...message,
      roomId,
      recipients
    }
  }))
  return { messages }
}

async function writeMessage ({ roomId = null, type = '', writter = '', content = '', recipients = [] }) {
  const insertMessage = getInsertMessage({ type, writter, content })
  const selectMessageId = getSelectLastInsertId()
  const setId = getSetId()
  const insertRecipients = recipients.length > 0
    ? getInsertGroupMessages({ roomId, recipients })
    : getInsertRoomMessage({ roomId })

  const resultSelectMessageId = (await transaction([insertMessage, selectMessageId, setId, insertRecipients]))[1]
  const { id } = resultSelectMessageId[0]

  const selectMessage = getSelectMessage({ id })
  const message = (await exec(selectMessage))[0]

  return {
    message: {
      ...message,
      roomId,
      recipients
    }
  }
}
export default {
  init,
  removeOfflineUser,

  getUserById,
  getUserBySocketId,
  signIn,
  signUp,
  signOut,

  getRooms,
  getRoomsJoined,
  getRoomsSearched,
  createRoom,
  updateRoom,
  deleteRoom,
  joinRoom,
  leaveRoom,

  getOnlineMembersInRoom,

  getMessagesInRoom,
  getMessagesInRoomReconnect,
  writeMessage
}
