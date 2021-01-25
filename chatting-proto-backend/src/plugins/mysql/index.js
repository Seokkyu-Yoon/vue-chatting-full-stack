import mysql from 'mysql'

import { logger } from '@/core'
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

async function init () {
  const tableResult = await query('SHOW TABLES')
  const tableKeys = Object.keys(tableResult)
  const tables = tableKeys.reduce((bucket, tableKey) => {
    return [
      ...bucket,
      ...Object.values(tableResult[tableKey])
    ]
  }, [])
  if (!tables.includes('user')) {
    const sql = `
    CREATE TABLE user (
      id VARCHAR(25) NOT NULL UNIQUE,
      name VARCHAR(50) NOT NULL UNIQUE,
      PRIMARY KEY (id, name)
    )
    `
    await query(sql)
  }
  if (!tables.includes('room')) {
    const sql = `
    CREATE TABLE room (
      id INT NOT NULL,
      title VARCHAR(100) NOT NULL,
      create_by VARCHAR(50) NOT NULL,
      pw VARCHAR(20) NOT NULL,
      max_join INT NOT NULL DEFAULT 0,
      description TEXT NOT NULL,
      last_updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    )`
    await query(sql)
  }

  if (!tables.includes('participant')) {
    const sql = `
    CREATE TABLE participant (
      room_id INT NOT NULL,
      user_id VARCHAR(25) NOT NULL,
      PRIMARY KEY (room_id, user_id),
      FOREIGN KEY (room_id) REFERENCES room (id) ON UPDATE CASCADE ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES user (id) ON UPDATE CASCADE ON DELETE CASCADE
    )`
    await query(sql)
  }

  if (!tables.includes('message_type')) {
    const sqlCreate = `CREATE TABLE message_type (
      idx INT NOT NULL UNIQUE,
      type TEXT NOT NULL,
      PRIMARY KEY (idx)
    )
    `
    const sqlInsert = `
    INSERT INTO message_type (idx, type) VALUES
    (1, 'text')
    `
    await query(sqlCreate)
    await query(sqlInsert)
  }

  if (!tables.includes('message')) {
    const sql = `
    CREATE TABLE message (
      idx INT NOT NULL AUTO_INCREMENT,
      room_id INT NOT NULL,
      type_idx INT NOT NULL,
      writter VARCHAR(50) NOT NULL,
      content TEXT NOT NULL,
      datetime DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (idx),
      FOREIGN KEY (room_id) REFERENCES room (id) ON UPDATE CASCADE ON DELETE CASCADE,
      FOREIGN KEY (type_idx) REFERENCES message_type (idx) ON UPDATE CASCADE ON DELETE RESTRICT
    )`
    await query(sql)
  }

  if (!tables.includes('recipient')) {
    const sql = `
    CREATE TABLE recipient (
      message_idx INT NOT NULL,
      user_name VARCHAR(50) NOT NULL,
      PRIMARY KEY (message_idx, user_name),
      FOREIGN KEY (message_idx) REFERENCES message (idx) ON UPDATE CASCADE ON DELETE CASCADE
    )`
    await query(sql)
  }
}

async function removeTrashUser (connectingSocketIds) {
  logger.info('cleaning users', connectingSocketIds)
  const sql = connectingSocketIds.length
    ? `
    DELETE FROM user
    WHERE id NOT IN (${connectingSocketIds.map((socketId) => `'${socketId}'`).join(', ')})
    `
    : 'DELETE FROM user'
  await query(sql)
  logger.info('finished cleaning')
}

async function isValidUser ({ userName = '' }) {
  if (!userName) return { isValid: false }
  const sql = `
  SELECT COUNT(*) AS length
  FROM user
  WHERE name='${userName}'
  `
  const result = await query(sql)
  const isValid = result[0].length === 0
  return { isValid }
}

async function getUserName ({ id = '' }) {
  if (!id) return { name: '' }
  const sql = `
  SELECT name
  FROM user
  WHERE id='${id}'
  `
  const result = await query(sql)
  const { name } = result[0]
  return { name }
}

async function getUsers ({ roomId = null, startIndex = 0 }) {
  if (roomId === null) throw new Error('roomId is empty')
  const COUNT = 10
  const sql = `
  SELECT user.id AS id, user.name AS name
  FROM participant
  LEFT JOIN user ON id=user_id
  WHERE room_id=${roomId}
  LIMIT ${COUNT} OFFSET ${startIndex}
  `
  const users = await query(sql)
  return { users }
}

async function login ({ userId = '', userName = '' }) {
  if (!userId || !userName) throw new Error('Fail to login')
  const { isValid } = await isValidUser({ userName })

  if (!isValid) throw new Error(`'${userName}' is already used`)
  const sqlInsertUser = `
  INSERT INTO user (id, name) VALUES ('${userId}', '${userName}')
  `
  await query(sqlInsertUser)

  return {
    isValid,
    userName,
    room: {}
  }
}

async function logout ({ userId = '' }) {
  if (userId === '') throw new Error('socketId is empty')
  const sqlRoomsOfUser = `
  SELECT room_id AS roomId
  FROM participant
  WHERE user_id='${userId}'
  `
  const result = await query(sqlRoomsOfUser)

  const sql = `
  DELETE FROM user WHERE id='${userId}'
  `
  await query(sql)

  const rooms = result.map(({ roomId }) => roomId)
  return { rooms }
}

async function existsRoom ({ id }) {
  const sql = `
  SELECT COUNT(*) AS length
  FROM room
  WHERE id=${id}
  `
  const result = await query(sql)
  const isExists = result[0].length > 0
  return { isExists }
}

async function getRoom ({ id = null }) {
  const { isExists } = await existsRoom({ id })
  if (!isExists) throw new Error(`'${id}' is not exists`)
  const sql = `
  SELECT room.id, room.title, room.create_by AS createBy, room.pw, room.max_join AS maxJoin, room.description, room.last_updated AS lastUpdated, COUNT(participant.room_id) AS joining
  FROM room
  LEFT JOIN participant ON id=room_id
  WHERE id=${id}
  GROUP BY room.id
  `
  const result = await query(sql)
  const room = result[0]
  return { room }
}

async function getRooms ({ startIndex = 0 }) {
  const COUNT = 10

  const sql = `
  SELECT room.id, room.title, room.create_by AS createBy, room.pw, room.max_join AS maxJoin, room.description, room.last_updated AS lastUpdated, COUNT(participant.room_id) AS joining
  FROM room
  LEFT JOIN participant ON id=room_id
  GROUP BY room.id
  LIMIT ${COUNT} OFFSET ${startIndex}
  `
  const rooms = await query(sql)
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
  const sql = `
  INSERT INTO room (
    id,
    title,
    create_by,
    pw,
    max_join,
    description
  ) VALUES (
    ${insertId},
    '${title}',
    '${createBy}',
    '${pw}',
    ${maxJoin},
    '${description}'
  )`
  await query(sql)

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

  const sql = `
  UPDATE room SET
    title='${title}',
    pw='${pw}',
    max_join=${maxJoin},
    description='${description}',
    last_updated=NOW()
  WHERE id=${id}
  `

  await query(sql)

  const { room } = await getRoom({ id })
  return { room }
}

async function deleteRoom ({ id = null }) {
  if (id === null) throw new Error('title is empty to delete room')

  const sqlDeleteRoom = `
  DELETE FROM room
  WHERE id=${id}
  `
  const sqlDeleteUsersInRoom = `
  DELETE FROM participant
  WHERE room_id=${id}
  `

  await query(sqlDeleteRoom)
  await query(sqlDeleteUsersInRoom)
  return { id }
}

async function joinRoom ({ id = null, pw = '', userId = '' }) {
  if (id === null || !userId) throw new Error('Invalid to join room')

  const { room } = await getRoom({ id })
  if (room.pw && room.pw !== pw) throw new Error('Invalid to join room')

  const sql = `
  INSERT INTO participant (room_id, user_id)
  VALUES (${id}, '${userId}')
  `
  await query(sql)

  return { room }
}

async function leaveRoom ({ id = null, userId = '' }) {
  if (id === null || !userId) throw new Error('Invalid to leave room')

  const { isExists } = await existsRoom({ id })
  if (!isExists) throw new Error(`id(${id}) room is not exists`)

  const sql = `
  DELETE FROM participant
  WHERE room_id=${id} AND user_id='${userId}'
  `
  await query(sql)
  return { id }
}

async function getMessages ({ roomId = null, minIndex = -1 }) {
  if (roomId === null) throw new Error('id is empty')
  const COUNT = 50

  let fixedIndex = minIndex
  if (minIndex === -1) {
    const sql = `
    SELECT COUNT(*) AS 'length'
    FROM message
    WHERE room_id=${roomId}
    `

    const result = await query(sql)
    fixedIndex = result[0].length
  }
  fixedIndex -= COUNT
  let fixedLimit = COUNT
  if (fixedIndex < 0) {
    fixedLimit = COUNT + fixedIndex
    fixedIndex = 0
  }
  const sqlGetMessages = `
  SELECT message.idx AS idx, message.room_id AS roomId, message_type.type AS type, message.writter AS writter, message.content, message.datetime
  FROM message
  LEFT JOIN message_type ON type_idx=message_type.idx
  WHERE room_id=${roomId}
  LIMIT ${fixedLimit} OFFSET ${fixedIndex}
  `

  const results = await query(sqlGetMessages)
  const messages = await Promise.all(results.map(async ({
    idx,
    roomId,
    type,
    writter,
    content,
    datetime
  }) => {
    const sqlGetRecipients = `
    SELECT user_name AS userName
    FROM recipient
    WHERE message_idx=${idx}
    `
    const result = await query(sqlGetRecipients)
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
  return { messages, minIndex: fixedIndex }
}

async function getMessageReconnect ({ roomId = null, startIndex = 0 }) {
  if (roomId === null) throw new Error('roomId is empty')
  const sqlGetMessages = `
  SELECT message.room_title AS title, message_type.type AS type, message.writter AS writter, message.content, message.datetime
  FROM message
  LEFT JOIN message_type ON type_idx=message_type.idx
  WHERE room_id=${roomId}
  LIMIT ${Number.MAX_SAFE_INTEGER} OFFSET ${startIndex}`

  const results = await query(sqlGetMessages)
  const messages = await Promise.all(results.map(async ({
    idx,
    roomId,
    type,
    writter,
    content,
    datetime
  }) => {
    const sqlGetRecipients = `
    SELECT user_name AS userName
    FROM recipient
    WHERE message_idx=${idx}
    `
    const result = await query(sqlGetRecipients)
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

  const sqlWrite = `
  INSERT INTO message (room_id, type_idx, writter, content)
  VALUES (${roomId}, (SELECT idx FROM message_type WHERE type='${type}'), '${writter}', '${content.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}')
  `
  const sqlGet = `
  SELECT message.room_id AS roomId, message_type.type AS type, message.writter AS writter, message.content, message.datetime
  FROM message
  LEFT JOIN message_type ON type_idx=message_type.idx
  ORDER BY message.idx DESC
  LIMIT 1;
  `

  await query(sqlWrite)
  const result = await query(sqlGet)
  const message = result[0]

  const hasRecipients = recipients.length
  if (hasRecipients) {
    const sqlRecipient = `
    INSERT INTO recipient (message_idx, user_name) VALUES
    ${recipients.map((userName) => `(${message.idx},'${userName}')`).join(',')}
    `
    await query(sqlRecipient)
  }
  return {
    message: {
      ...message,
      recipients
    }
  }
}

export default {
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
