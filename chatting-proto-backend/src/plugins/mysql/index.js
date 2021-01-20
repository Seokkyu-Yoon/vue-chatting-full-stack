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

function transaction (sqls = []) {
  const connection = mysql.createConnection(ConfigMysql)
  return new Promise((resolve, reject) => {
    connection.beginTransaction(async (err) => {
      if (err) {
        reject(err)
        connection.end()
        return
      }
      await Promise.all(sqls.map(async (sql) => await query(sql)))
        .then((results) => {
          connection.commit((err) => {
            if (err) {
              connection.rollback(() => reject(err))
              connection.end()
              return
            }
            resolve(results)
          })
        })
        .catch((err) => connection.rollback(() => reject(err)))
    })
    connection.end()
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
      title VARCHAR(100) NOT NULL,
      create_by VARCHAR(50) NOT NULL,
      pw VARCHAR(20) NOT NULL,
      max_join INT NOT NULL DEFAULT 0,
      description TEXT NOT NULL,
      last_updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (title),
    )`
    await query(sql)
  }

  if (!tables.includes('participant')) {
    const sql = `
    CREATE TABLE participant (
      room_title VARCHAR(100) NOT NULL,
      user_id VARCHAR(25) NOT NULL,
      PRIMARY KEY (room_title, user_name),
      FOREIGN KEY (room_title) REFERENCES room (title) ON UPDATE CASCADE ON DELETE CASCADE
      FOREIGN KEY (user_id) REFERENCES user (id) ON UPDATE CASCADE ON DELETE CASCADE
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
      room_title VARCHAR(100) NOT NULL,
      type_idx INT NOT NULL,
      writter VARCHAR(50) NOT NULL,
      content TEXT NOT NULL,
      datetime DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (idx),
      FOREIGN KEY (room_title) REFERENCES room (title) ON UPDATE CASCADE ON DELETE CASCADE,
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

async function getUsers ({ roomTitle = '', startIndex = 0 }) {
  if (!roomTitle) throw new Error('room title is empty')
  const COUNT = 10
  const sql = `
  SELECT user.id, user.name
  FROM user
  RIGHT JOIN user ON id=user_id
  WHERE room_title='${roomTitle}'
  LIMIT ${COUNT} OFFSET ${startIndex}
  `
  const users = await query(sql)
  return { users }
}

async function login ({ socketId = '', userName = '', roomTitle = '' }) {
  if (!socketId || !userName) throw new Error('Fail to login')
  const { isValid } = await isValidUser({ userName })

  if (!isValid) throw new Error(`'${userName}' is already used`)
  const sqlInsertUser = `
  INSERT INTO user (id, name) VALUES ('${socketId}', '${userName}')
  `
  await query(sqlInsertUser)

  if (!roomTitle) {
    return {
      isValid,
      userName,
      roomTitle
    }
  }

  const body = await joinRoom(roomTitle, userName)
  return {
    ...body,
    isValid,
    userName
  }
}

async function logout ({ userId = '' }) {
  if (userId === '') throw new Error('socketId is empty')
  const sqlRoomsOfUser = `
  SELECT room_title
  FROM participant
  WHERE user_id='${userId}'
  `
  const result = await query(sqlRoomsOfUser)

  const sql = `
  DELETE FROM user WHERE id='${userId}'
  `
  await query(sql)

  const rooms = result.map(({ room_title: roomTitle }) => roomTitle)
  return { rooms }
}

async function existsRoom ({ title }) {
  const sql = `
  SELECT COUNT(*) AS length
  FROM room
  WHERE title='${title}'
  `
  const result = query(sql)
  const isExists = result[0].length > 0
  return { isExists }
}

async function getRoom ({ title = '' }) {
  const { isExists } = await existsRoom({ title })
  if (!isExists) throw new Error(`'${title}' is not exists`)
  const sql = `
  SELECT room.title, room.create_by, room.pw, room.max_join, room.description, room.last_updated, COUNT(participant.room_title) AS joining
  FROM room
  WHERE title='${title}'
  LEFT JOIN participant ON title=room_title
  GROUP BY room.title
  `
  const result = await query(sql)
  const room = result[0]
  return { room }
}

async function getRooms ({ startIndex = 0 }) {
  const COUNT = 10

  const sql = `
  SELECT room.title, room.create_by, room.pw, room.max_join, room.description, room.last_updated, COUNT(participant.room_title) AS joining
  FROM room
  LEFT JOIN participant ON title=room_title
  GROUP BY room.title
  LIMIT ${COUNT} OFFSET ${startIndex}
  `
  const rooms = await query(sql)
  return { rooms }
}

async function createRoom ({
  title = '',
  createBy = '',
  pw = '',
  maxJoin = 0,
  description = ''
}) {
  if (!title || !createBy) {
    throw new Error(`[title:'${title}' createBy:'${createBy}'] Invalid to create room`)
  }

  const { isExists } = await existsRoom({ title })
  if (isExists) throw new Error(`room('${title}') already exists`)
  const sql = `
  INSERT INTO room (
    title,
    create_by
    pw,
    max_join,
    description
  ) VALUES (
    '${title}',
    '${createBy}',
    '${pw}',
    ${maxJoin},
    '${description}'
  )`

  await query(sql)

  const { room } = await getRoom({ title })
  return { room }
}

async function updateRoom ({
  title = '',
  pw = '',
  maxJoin = 0,
  description = ''
}) {
  if (!title) throw new Error('title is empty to update room')

  const { isExists } = await existsRoom({ title })
  if (isExists) throw new Error(`title('${title}') is already used`)

  const sql = `
  UPDATE room
    SET title='${title}',
    SET pw='${pw}',
    SET max_join=${maxJoin},
    SET description='${description}',
    SET last_updated=NOW()
  WHERE title=${title}'
  `

  await query(sql)

  const { room } = await getRoom({ title })
  return { room }
}

async function deleteRoom ({ title = '' }) {
  if (!title) throw new Error('title is empty to delete room')

  const sqlDeleteRoom = `
  DELETE FROM room
  WHERE title='${title}'
  `
  const sqlDeleteUsersInRoom = `
  DELETE FROM participant
  WHERE room_title='${title}'
  `

  await transaction([
    sqlDeleteRoom,
    sqlDeleteUsersInRoom
  ])
  return { title }
}

async function joinRoom ({ title = '', pw = '', userId = '' }) {
  if (!title || !userId) throw new Error('Invalid to join room')

  const { room } = await getRoom({ title })
  if (room.pw && room.pw !== pw) throw new Error('Invalid to join room')

  const sql = `
  INSERT INTO participant (room_title, user_id)
  VALUES ('${title}', '${userId}')
  `
  await query(sql)

  return { room }
}

async function leaveRoom ({ title = '', userId = '' }) {
  if (!title || !userId) throw new Error('Invalid to leave room')

  const { isExists } = await existsRoom({ title })
  if (!isExists) throw new Error(`title('${title}') room is not exists`)

  const sql = `
  DELETE FROM participant
  WHERE room_title='${title}' AND user_id='${userId}'
  `
  await query(sql)
  return { title }
}

async function getMessages ({ title = '', minIndex = -1 }) {
  if (!title) throw new Error('title is empty')
  const COUNT = 50

  let fixedIndex = minIndex
  if (minIndex === -1) {
    const sql = `
    SELECT COUNT(*) AS 'length'
    FROM message
    WHERE room_title='${title}'
    `

    const result = await query(sql)
    fixedIndex = result[0].length
  }
  fixedIndex -= COUNT
  if (fixedIndex < 0) {
    fixedIndex = 0
  }
  const sql = `
  SELECT *
  FROM message
  WHERE room_title='${title}'
  LIMIT ${COUNT} OFFSET ${fixedIndex}
  `

  const messages = await query(sql)
  return { messages, minIndex: fixedIndex }
}

async function getMessageReconnect ({ title = '', startIndex = 0 }) {
  if (!title) throw new Error('title is empty')
  const sql = `
  SELECT *
  FROM message
  WHERE room_title='${title}'
  LIMIT ${Number.MAX_SAFE_INTEGER} OFFSET ${startIndex}`

  const messages = await query(sql)
  return { messages }
}

async function writeMessage ({
  title = '',
  typeIdx = 1,
  writter = '',
  content = '',
  recipients = []
}) {
  if (!title || !writter || !content) throw new Error('Invalid to write message')

  const sql = `
  INSERT INTO message (room_title, type_idx, writter, content)
  VALUES ('${title}', ${typeIdx}, '${writter}', '${content}');

  SELECT *
  FROM message
  WHERE idx=LAST_INSERT_ID();
  `
  const result = await query(sql)
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
    ...message,
    recipients
  }
}

export default {
  init,
  removeTrashUser,

  isValidUser,
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
