import { ConfigMysql } from '@/config'

// for init
const getSelectAllTables = () => ({
  sql: `
  SELECT table_name as tableName
    FROM information_schema.tables
    WHERE table_schema = ?
  `,
  params: [ConfigMysql.database]
})

const getCreateTableRoom = () => ({
  sql: `
  CREATE TABLE room (
    id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    create_by VARCHAR(50) NOT NULL,
    pw VARCHAR(20) NOT NULL,
    max_join INT NOT NULL DEFAULT 0,
    description TEXT NOT NULL,
    last_updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
  )
  `,
  params: []
})

const getCreateTableUser = () => ({
  sql: `
  CREATE TABLE user (
    id INT NOT NULL UNIQUE,
    socket_id VARCHAR(25) NOT NULL,
    name VARCHAR(50) NOT NULL UNIQUE,
    PRIMARY KEY (socket_id)
  )
  `,
  params: []
})

const getCreateTableMessageType = () => ({
  sql: `
  CREATE TABLE message_type (
    idx INT NOT NULL UNIQUE,
    type TEXT NOT NULL,
    PRIMARY KEY (idx)
  )
  `,
  params: []
})

const getInsertMessageType = ({ idx, type }) => ({
  sql: `
  INSERT INTO message_type (idx, type) VALUES
  (?, ?)
  `,
  params: [
    idx,
    type
  ]
})

const getCreateTableMessage = () => ({
  sql: `
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
  )
  `,
  params: []
})

const getCreateTableParticipant = () => ({
  sql: `
  CREATE TABLE participant (
    room_id INT NOT NULL,
    socket_id VARCHAR(25) NOT NULL,
    PRIMARY KEY (room_id, socket_id),
    FOREIGN KEY (room_id) REFERENCES room (id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (socket_id) REFERENCES user (socket_id) ON UPDATE CASCADE ON DELETE CASCADE
  )
  `,
  params: []
})

const getCreateTableRecipient = () => ({
  sql: `
  CREATE TABLE recipient (
    message_idx INT NOT NULL,
    user_name VARCHAR(50) NOT NULL,
    PRIMARY KEY (message_idx, user_name),
    FOREIGN KEY (message_idx) REFERENCES message (idx) ON UPDATE CASCADE ON DELETE CASCADE
  )
  `,
  params: []
})

const getCreateTableLastJoined = () => ({
  sql: `
  CREATE TABLE last_joined (
    user_id INT NOT NULL,
    room_id INt NOT NULL,
    last_joined DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, room_id),
    FOREIGN KEY (room_id) REFERENCES room (id) ON UPDATE CASCADE ON DELETE CASCADE
  )
  `,
  params: []
})

// for room
const getSelectCountRoom = ({ id }) => ({
  sql: `
  SELECT COUNT(*) AS length
  FROM room
  WHERE id=?
  `,
  params: [id]
})

const COUNT_ROOM = 30
const getSelectRooms = ({ startIndex, limit, userId }) => ({
  sql: `
  SELECT room.id, room.title, room.create_by AS createBy, room.pw, room.max_join AS maxJoin, room.description, room.last_updated AS lastUpdated, COUNT(participant.room_id) AS joining
  FROM room
  LEFT JOIN last_joined ON last_joined.user_id = ? AND last_joined.room_id = room.id
  LEFT JOIN participant ON room.id=participant.room_id
  GROUP BY room.id
  ORDER BY last_joined.last_joined IS NULL ASC, last_joined.last_joined DESC, room.last_updated DESC
  LIMIT ? OFFSET ?
  `,
  params: [userId, limit || COUNT_ROOM, startIndex]
})

const getSelectRoom = ({ id }) => ({
  sql: `
  SELECT room.id, room.title, room.create_by AS createBy, room.pw, room.max_join AS maxJoin, room.description, room.last_updated AS lastUpdated, COUNT(participant.room_id) AS joining
  FROM room
  LEFT JOIN participant ON id=room_id
  WHERE id=?
  GROUP BY room.id
  `,
  params: [id]
})

const getSelectRoomIdBy = ({ socketId }) => ({
  sql: `
  SELECT room_id AS roomId
  FROM participant
  WHERE socket_id=?
  `,
  params: [socketId]
})

const getInsertRoom = ({ id, title, createBy, pw, maxJoin, description }) => ({
  sql: `
  INSERT INTO room (
    id,
    title,
    create_by,
    pw,
    max_join,
    description
  ) VALUES (
    ?,
    ?,
    ?,
    ?,
    ?,
    ?
  )
  `,
  params: [id, title, createBy, pw, maxJoin, description]
})

const getUpdateRoom = ({ id, title, pw, maxJoin, description }) => ({
  sql: `
  UPDATE room SET
    title=?,
    pw=?,
    max_join=?,
    description=?
  WHERE id=?`,
  params: [title, pw, maxJoin, description, id]
})

const getDeleteRoom = ({ id }) => ({
  sql: `
  DELETE FROM room
  WHERE id=?
  `,
  params: [id]
})

// for user
const getSelectCountUser = ({ userName }) => ({
  sql: `
  SELECT COUNT(*) AS length
  FROM user
  WHERE name=?
  `,
  params: [userName]
})

const getSelectUserId = ({ socketId }) => ({
  sql: `
  SELECT id AS userId
  FROM user
  WHERE socket_id=?
  `,
  params: [socketId]
})

const getSelectUserName = ({ id }) => ({
  sql: `
  SELECT name
  FROM user
  WHERE id=?
  `,
  params: [id]
})

const getSelectUsers = () => ({
  sql: `
  SELECT user.id AS id, user.socket_id AS socketId, user.name AS name, participant.room_id AS roomId
  FROM participant
  LEFT JOIN user ON user.socket_id=participant.socket_id
  ORDER BY participant.room_id
  `,
  params: []
})

const getSelectUsersIn = ({ roomId }) => ({
  sql: `
  SELECT user.id AS id, user.socket_id AS socketId, user.name AS name
  FROM participant
  LEFT JOIN user ON user.socket_id=participant.socket_id
  WHERE room_id=?
  `,
  params: [roomId]
})

const getInsertUser = ({ id = Math.round(Math.random() * 9999999), socketId = '', name = '' }) => ({
  sql: `
  INSERT INTO user (id, socket_id, name) VALUES
  (?, ?, ?)
  `,
  params: [id, socketId, name]
})

const getDeleteUserBy = ({ socketId }) => ({
  sql: `
  DELETE FROM user
  WHERE socket_id=?
  `,
  params: [socketId]
})

const getDeleteUserNotIn = ({ connectingSocketIds }) => {
  const sqlBasic = 'DELETE FROM user'
  const sql = connectingSocketIds.length > 0
    ? `
      ${sqlBasic}
      WHERE socket_id NOT IN (${new Array(connectingSocketIds.length).fill('?').join(', ')})
    `
    : sqlBasic

  return {
    sql,
    params: [
      ...connectingSocketIds
    ]
  }
}

// for message
const getSelectCountMessage = ({ roomId }) => ({
  sql: `
  SELECT COUNT(*) AS length
  FROM message
  WHERE room_id=?
  `,
  params: [roomId]
})

const getSelectMessage = ({ roomId, limit, offset }) => ({
  sql: `
  SELECT message.idx AS idx, message.room_id AS roomId, message_type.type AS type, message.writter AS writter, message.content, message.datetime
  FROM message
  LEFT JOIN message_type ON type_idx=message_type.idx
  WHERE room_id=?
  LIMIT ? OFFSET ?
  `,
  params: [roomId, limit, offset]
})

const getSelectInsertedMessage = () => ({
  sql: `
  SELECT message.idx, message.room_id AS roomId, message_type.type AS type, message.writter AS writter, message.content, message.datetime
  FROM message
  LEFT JOIN message_type ON type_idx=message_type.idx
  ORDER BY message.idx DESC
  LIMIT 1
  `,
  params: []
})

const getInsertMessage = ({ roomId, type, writter, content }) => ({
  sql: `
  INSERT INTO message (room_id, type_idx, writter, content)
  VALUES (?, (SELECT idx FROM message_type WHERE type=?), ?, ?)
  `,
  params: [roomId, type, writter, content]
})

// for recipient
const getSelectRecipient = ({ messageIdx }) => ({
  sql: `
  SELECT user_name AS userName
  FROM recipient
  WHERE message_idx=?
  `,
  params: [messageIdx]
})

const getInsertRecipient = ({ messageIdx, userName }) => ({
  sql: `
  INSERT INTO recipient (message_idx, userName) VALUES
  (?, ?)
  `,
  params: [messageIdx, userName]
})

// for participant
const getInsertParticipant = ({ roomId, socketId }) => ({
  sql: `
  INSERT INTO participant (room_id, socket_id)
  VALUES (?, ?)
  `,
  params: [roomId, socketId]
})

const getDeleteParticipant = ({ roomId, socketId }) => ({
  sql: `
  DELETE FROM participant
  WHERE room_id=? AND socket_id=?
  `,
  params: [roomId, socketId]
})

// for lastJoined
const getSelectCountLastJoined = ({ userId, roomId }) => ({
  sql: `
  SELECT COUNT(*) AS length
  FROM last_joined
  WHERE user_id=? AND room_id=?
  `,
  params: [userId, roomId]
})

const getInsertLastJoined = ({ userId, roomId }) => ({
  sql: `
  INSERT INTO last_joined (user_id, room_id) VALUES
  (?, ?)
  `,
  params: [userId, roomId]
})

const getUpdateLastJoined = ({ userId, roomId }) => ({
  sql: `
  UPDATE last_joined SET
    last_joined=NOW()
  WHERE user_id=? AND room_id=?
  `,
  params: [userId, roomId]
})

export {
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
}
