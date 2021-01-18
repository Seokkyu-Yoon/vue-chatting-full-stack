import mysql from 'mysql'

import { logger } from '@/core'
import nodemonJson from '../../../nodemon.json'

function query (sql) {
  const connection = mysql.createConnection({
    host: process.env.MYSQL_IP || nodemonJson.env.MYSQL_IP,
    port: Number(process.env.MYSQL_PORT) || nodemonJson.env.MYSQL_PORT,
    user: 'root',
    password: 'qwer1234',
    database: process.env.MYSQL_DATABASE || nodemonJson.env.MYSQL_DATABASE
  })
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

async function init () {
  const tableResult = await query('SHOW TABLES;')
  const tableKeys = Object.keys(tableResult)
  const tables = tableKeys.reduce((bucket, tableKey) => {
    return [
      ...bucket,
      ...Object.values(tableResult[tableKey])
    ]
  }, [])

  if (!tables.includes('room')) {
    const sql = `
    CREATE TABLE room (
      id VARCHAR(32) NOT NULL,
      title TEXT NOT NULL,
      pw VARCHAR(20) NOT NULL,
      max_join INT NOT NULL DEFAULT 0,
      description TEXT NOT NULL,
      last_updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    )`
    await query(sql)
  }

  if (!tables.includes('message_type')) {
    const sql = `CREATE TABLE message_type (
      idx INT NOT NULL AUTO_INCREMENT,
      type TEXT NOT NULL,
      PRIMARY KEY (idx)
    )`
    await query(sql)
  }

  if (!tables.includes('message')) {
    const sql = `
    CREATE TABLE message (
      idx INT NOT NULL AUTO_INCREMENT,
      room_id VARCHAR(32) NOT NULL,
      type_idx INT NOT NULL,
      writter VARCHAR(50) NOT NULL,
      content TEXT NOT NULL,
      datetime DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (idx),
      FOREIGN KEY (room_id) REFERENCES room (id) ON UPDATE NO ACTION ON DELETE NO ACTION,
      FOREIGN KEY (type_idx) REFERENCES message_type (idx) ON UPDATE CASCADE ON DELETE RESTRICT
    )`
    await query(sql)
  }

  if (!tables.includes('message_recipient')) {
    const sql = `
    CREATE TABLE message_recipient (
      message_idx INT NOT NULL,
      user_name VARCHAR(50) NOT NULL,
      PRIMARY KEY (message_idx, user_name),
      FOREIGN KEY (message_idx) REFERENCES message (idx) ON UPDATE CASCADE ON DELETE CASCADE
    )`
    await query(sql)
  }
}

async function existsRoom () {
  return false
}

async function createRoom ({
  id = null,
  title = '',
  pw = '',
  maxJoin = 0,
  description = ''
}) {
  if (id === null) {
    throw new Error('id is not nullable')
  }
  const sql = `
  INSERT INTO room (
    id,
    title,
    pw,
    max_join,
    description
  ) VALUES (
    '${id}',
    '${title}',
    '${pw}',
    ${maxJoin},
    '${description}'
  )`

  await query(sql)
  return id
}

async function updateRoom ({
  id = null,
  title = '',
  pw = '',
  maxJoin = 0,
  description = ''
}) {
  if (id === null) {
    throw new Error('id is not nullable')
  }
  const sql = `
  UPDATE room
    SET title='${title}',
    SET pw='${pw}',
    SET max_join=${maxJoin},
    SET description='${description}'
  WHERE id='${id}'
  `

  await query(sql)
  return id
}

async function deleteRoom ({ id = null }) {
  if (id === null) {
    throw new Error('id is not nullable')
  }
  const sql = `
  DELETE FROM room
  WHERE id='${id}'
  `

  await query(sql)
}

async function getMessages ({ roomId = null, startIndex = -1 }) {
  if (roomId === null) throw new Error('room_id is not nullable')
  const COUNT = 50

  let fixedIndex = startIndex
  if (startIndex === -1) {
    const sql = `
    SELECT COUNT(*)
    FROM message
    WHERE room_id='${roomId}'
    `

    const result = await query(sql)
    console.log(result)
    fixedIndex = Object.values(result[0])[0] - COUNT
    if (fixedIndex < 0) {
      fixedIndex = 0
    }
  }
  const sql = `
  SELECT *
  FROM message
  WHERE room_id='${roomId}'
  ORDERS LIMIT ${COUNT} OFFSET ${fixedIndex}
  `

  const result = await query(sql)
  return [result, fixedIndex]
}

export {
  init,

  existsRoom,
  createRoom,
  updateRoom,
  deleteRoom,

  getMessages
}

export default {
  init,

  existsRoom,
  createRoom,
  updateRoom,
  deleteRoom,

  getMessages
}
// async function createRoom ({
//   key = null,
//   createBy = null,
//   title = null,
//   password = '',
//   maxJoin = 0,
//   description = '',
// }) {
//   if (key === null || createBy === null || title === null) {
//     throw new Error('Invalid create room')
//   }
//   const sql = `INSERT INTO room (
//     key,
//     createBy,
//     title,
//     password,
//     max_join,
//     description,
//   ) VALUES (
//     '${key}',
//     '${createBy}',
//     '${title}',
//     '${password}',
//     ${maxJoin},
//     '${description}'
//   );`

//   const result = await query(sql)
//   return key
// }

// async function getMessages (roomIdx) {
//   const sql = `SELECT * FROM message WHERE idx=${roomIdx}`

//   return await query(sql)
// }

// async function getSocketIds () {
//   const sql = 'SELECT id FROM user'
//   const socketIds = new Set(await query(sql))
//   return socketIds
// }

// async function getUserName (socketId) {
//   const sql = `SELECT userName FROM user WHERE id='${socketId}'`
//   const userName = await query(sql)[0]
//   return userName
// }

// async function checkLastUpdated (roomKey) {
//   const now = new Date()
//   const lastUpdated = await redis.get(`room:${roomKey}:lastUpdated`)
//   if (!isAnotherDate(now, new Date(lastUpdated))) return

//   const { year, month, date } = extractDate(now)
//   const text = `${year}년 ${month}월 ${date}일`

//   const message = {
//     type: 'time',
//     text,
//     recipients: []
//   }
//   await messageToJson(roomKey, message)
// }

// async function writeMessage ({
//   type,
//   userName,
//   roomKey,
//   text = '',
//   recipients = []
// } = {}) {
//   await checkLastUpdated(roomKey)

//   const now = new Date()
//   const time = getFormattedTime(now)

//   const message = {
//     type,
//     userName,
//     text,
//     time,
//     recipients
//   }
//   await redis.set(`room:${roomKey}:lastUpdated`, now)
//   await messageToJson(roomKey, message)
//   return message
// }

// async function joinRoom ({ userName, roomKey } = {}) {
//   return await writeMessage({
//     type: 'join',
//     userName,
//     roomKey
//   })
// }

// async function createRoom ({
//   userName,
//   roomKey,
//   roomName,
//   roomPassword = '',
//   roomMaxJoin = 0,
//   roomDesc = ''
// } = {}) {
//   const lastUpdated = new Date()
//   lastUpdated.setDate(0)

//   const roomIdentify = `room:${roomKey}`

//   await redis.multi()
//     .sadd('rooms', roomKey)
//     .set(`${roomIdentify}:createBy`, userName)
//     .set(`${roomIdentify}:name`, roomName)
//     .set(`${roomIdentify}:password`, roomPassword)
//     .set(`${roomIdentify}:maxJoin`, roomMaxJoin)
//     .set(`${roomIdentify}:description`, roomDesc)
//     .set(`${roomIdentify}:lastUpdated`, lastUpdated)
//     .exec((e) => {
//       if (e === null) return
//       throw new Error(e)
//     })
//   await messageToJson(roomKey)
// }

// async function updateRoom ({
//   roomKey,
//   roomName,
//   roomPassword = '',
//   roomMaxJoin = 0,
//   roomDesc = ''
// } = {}) {
//   const roomIdentify = `room:${roomKey}`

//   await redis.multi()
//     .set(`${roomIdentify}:name`, roomName)
//     .set(`${roomIdentify}:password`, roomPassword)
//     .set(`${roomIdentify}:maxJoin`, roomMaxJoin)
//     .set(`${roomIdentify}:description`, roomDesc)
//     .exec((e) => {
//       if (e === null) return
//       throw new Error(e)
//     })
// }

// async function leaveRoom ({ userName, roomKey } = {}) {
//   return await writeMessage({
//     type: 'leave',
//     userName,
//     roomKey
//   })
// }

// async function existsRoom ({ roomKey } = {}) {
//   return await redis.sismember('rooms', roomKey)
// }

// async function deleteRoom ({ roomKey } = {}) {
//   const roomIdentify = `room:${roomKey}`

//   await redis.multi()
//     .srem('rooms', roomKey)
//     .del(`${roomIdentify}:createBy`)
//     .del(`${roomIdentify}:name`)
//     .del(`${roomIdentify}:password`)
//     .del(`${roomIdentify}:maxJoin`)
//     .del(`${roomIdentify}:description`)
//     .del(`${roomIdentify}:lastUpdated`)
//     .exec((e) => {
//       if (e === null) return
//       throw new Error(e)
//     })

//   const messagesPath = getMessagesPath(roomKey)
//   await messageFileManager.remove(messagesPath)
// }

// async function getRoom (roomKey = null) {
//   const radisRoomKeys = roomKey === null ? await redis.smembers('rooms') : [roomKey]
//   const roomMap = {}

//   await Promise.all(
//     radisRoomKeys.map(async (radisRoomKey) => {
//       const roomIdentify = `room:${radisRoomKey}`
//       const createBy = await redis.get(`${roomIdentify}:createBy`)
//       const roomName = await redis.get(`${roomIdentify}:name`)
//       const roomPassword = await redis.get(`${roomIdentify}:password`)
//       const roomMaxJoin = Number(await redis.get(`${roomIdentify}:maxJoin`))
//       const roomDesc = await redis.get(`${roomIdentify}:description`)
//       const roomLastUpdated = await redis.get(`${roomIdentify}:lastUpdated`)
//       const room = {
//         createBy,
//         roomName,
//         roomPassword,
//         roomMaxJoin,
//         roomDesc,
//         roomLastUpdated
//       }
//       roomMap[radisRoomKey] = room
//     })
//   )
//   return roomMap
// }

// export default {
//   addUser,
//   deleteUser,
//   getUserName,
//   getSocketIds,
//   isUserExists,

//   writeMessage,
//   createRoom,
//   updateRoom,
//   joinRoom,
//   leaveRoom,
//   existsRoom,
//   deleteRoom,

//   getRoom,
//   getMessages
// }
