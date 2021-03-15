import { ConfigMysql } from '@/config'
// utils
function getSelectLastInsertId () {
  return {
    sql: `
    SELECT LAST_INSERT_ID() AS id`,
    params: []
  }
}
function getSetId () {
  return {
    sql: `
    SET @id = LAST_INSERT_ID()`,
    params: []
  }
}

// for init
function getSelectAllTables () {
  return {
    sql: `
    SELECT table_name as tableName
    FROM information_schema.tables
    WHERE table_schema = ?`,
    params: [ConfigMysql.database]
  }
}
function getCreateTableOnline () {
  return {
    sql: `
    CREATE TABLE online (
      socket_id VARCHAR(25),
      user_id VARCHAR(20) NOT NULL,
      PRIMARY KEY (socket_id)
    )`,
    params: []
  }
}
function getCreateTableUser () {
  return {
    sql: `
    CREATE TABLE user (
      id VARCHAR(20),
      pw VARCHAR(20) NOT NULL,
      name VARCHAR(50) NOT NULL,
      email VARCHAR(50),
      phone VARCHAR(15),
      PRIMARY KEY (id)
    )`,
    params: []
  }
}
function getCreateTableRoom () {
  return {
    sql: `
    CREATE TABLE room (
      id INT AUTO_INCREMENT,
      create_by VARCHAR(20) NOT NULL,
      title VARCHAR(100) NOT NULL,
      pw VARCHAR(20) NOT NULL,
      max_join INT NOT NULL DEFAULT 0,
      description TEXT NOT NULL,
      create_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      update_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      FOREIGN KEY (create_by) REFERENCES user (id) ON UPDATE CASCADE ON DELETE CASCADE
    )`,
    params: []
  }
}
function getCreateTableMember () {
  return {
    sql: `
    CREATE TABLE member (
      user_id VARCHAR(20),
      room_id INT,
      socket_id VARCHAR(25),
      last_joined DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, room_id),
      FOREIGN KEY (user_id) REFERENCES user (id) ON UPDATE CASCADE ON DELETE CASCADE,
      FOREIGN KEY (room_id) REFERENCES room (id) ON UPDATE CASCADE ON DELETE CASCADE,
      FOREIGN KEY (socket_id) REFERENCES online (socket_id) ON DELETE SET NULL
    )`,
    params: []
  }
}
function getCreateTableMessageType () {
  return {
    sql: `
    CREATE TABLE message_type (
      id INT,
      type VARCHAR(10),
      PRIMARY KEY (id)
    )`,
    params: []
  }
}
function getInsertMessageType ({ id, type }) {
  return {
    sql: `
    INSERT INTO message_type (id, type) VALUES
    (?, ?)`,
    params: [id, type]
  }
}
function getCreateTableMessage () {
  return {
    sql: `
    CREATE TABLE message (
      id INT AUTO_INCREMENT,
      type_id INT NOT NULL,
      writter VARCHAR(20) NOT NULL,
      content TEXT NOT NULL,
      write_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      FOREIGN KEY (type_id) REFERENCES message_type (id) ON UPDATE CASCADE ON DELETE RESTRICT,
      FOREIGN KEY (writter) REFERENCES user (id) ON UPDATE CASCADE ON DELETE CASCADE
    )`,
    params: []
  }
}
function getCreateTableDirectMessage () {
  return {
    sql: `
    CREATE TABLE direct_message (
      message_id INT,
      user_id VARCHAR(20),
      PRIMARY KEY (message_id, user_id),
      FOREIGN KEY (message_id) REFERENCES message (id) ON UPDATE CASCADE ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES user (id) ON UPDATE CASCADE ON DELETE CASCADE
    )`,
    params: []
  }
}
function getCreateTableRoomMessage () {
  return {
    sql: `
    CREATE TABLE room_message (
      message_id INT,
      room_id INT,
      PRIMARY KEY (message_id, room_id),
      FOREIGN KEY (message_id) REFERENCES message (id) ON UPDATE CASCADE ON DELETE CASCADE,
      FOREIGN KEY (room_id) REFERENCES room (id) ON UPDATE CASCADE ON DELETE CASCADE
    )`,
    params: []
  }
}
function getCreateTableGroupMessage () {
  return {
    sql: `
    CREATE TABLE group_message (
      message_id INT,
      room_id INT,
      user_id VARCHAR(20),
      PRIMARY KEY (message_id, room_id, user_id),
      FOREIGN KEY (message_id) REFERENCES message (id) ON UPDATE CASCADE ON DELETE CASCADE,
      FOREIGN KEY (room_id) REFERENCES room (id) ON UPDATE CASCADE ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES user (id) ON UPDATE CASCADE ON DELETE CASCADE
    )`,
    params: []
  }
}

function getCreateTableFileInfo () {
  return {
    sql: `
    CREATE TABLE file_info (
      id varchar(100) COLLATE utf8_bin NOT NULL,
      filename varchar(45) COLLATE utf8_bin NOT NULL,
      size double NOT NULL,
      upload_user varchar(45) COLLATE utf8_bin NOT NULL,
      room_id varchar(45) COLLATE utf8_bin NOT NULL,
      register_date date NOT NULL,
      expire_date date NOT NULL,
      is_protected tinyint(4) NOT NULL,
      passwd varchar(45) COLLATE utf8_bin NOT NULL,
      state varchar(20) COLLATE utf8_bin NOT NULL,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='업로드 파일 정보 DB'`,
    params: []
  }
}

// for online
function getSelectOnlineUsers () {
  return {
    sql: `
    SELECT user_id AS userId
    FROM online`
  }
}
function getSelectOfflineUsers ({ connectingSocketIds }) {
  if (connectingSocketIds.length === 0) {
    return {
      sql: `
      SELECT socket_id AS socketId
      FROM online`,
      params: []
    }
  }
  return {
    sql: `
    SELECT socket_id AS socketId
    FROM online
    WHERE socket_id NOT IN (?)`,
    params: [connectingSocketIds]
  }
}
function getSelectUserAlreadyOnline ({ socketId, userId }) {
  return {
    sql: `
    SELECT COUNT(*) AS length
    FROM online
    WHERE socket_id=? AND user_id=?`,
    params: [socketId, userId]
  }
}
function getInsertOnlineUser ({ socketId, userId }) {
  return {
    sql: `
    INSERT INTO online (socket_id, user_id)
    VALUES (?, ?)`,
    params: [socketId, userId]
  }
}
function getDeleteOnlineUser ({ socketId }) {
  return {
    sql: `
    DELETE FROM online
    WHERE socket_id=?`,
    params: [socketId]
  }
}

// for user
function getSelectCountUser ({ id }) {
  return {
    sql: `
    SELECT COUNT(*) AS length
    FROM user
    WHERE id=?`,
    params: [id]
  }
}
function getSelectUserIsValid ({ id, pw }) {
  return {
    sql: `
    SELECT id, pw, name, email, phone
    FROM user
    WHERE id=? AND pw=?`,
    params: [id, pw]
  }
}
function getSelectUserBySocketId ({ socketId }) {
  return {
    sql: `
    SELECT user.id, user.name, user.email, user.phone
    FROM user
    LEFT JOIN online ON user.id=online.user_id
    WHERE socket_id=?`,
    params: [socketId]
  }
}
function getSelectUserById ({ id }) {
  return {
    sql: `
    SELECT id, pw, name, email, phone
    FROM user
    WHERE id=?`,
    params: [id]
  }
}

function getInsertUser ({ id, pw, name, email, phone }) {
  return {
    sql: `
    INSERT INTO user (id, pw, name, email, phone)
    VALUES (?, ?, ?, ?, ?)`,
    params: [id, pw, name, email, phone]
  }
}

// for room
const COUNT_ROOM = 30
function getSelectRooms ({ startIndex, limit }) {
  return {
    sql: `
    SELECT room.id, room.pw, room.create_by AS createBy, room.title, room.max_join AS maxJoin, room.description, room.create_at AS createAt, room.update_at AS updateAt, COUNT(CASE WHEN member.socket_id IS NOT NULL THEN 1 END) AS joining
    FROM room
    LEFT JOIN member ON member.room_id=room.id
    GROUP BY room.id
    ORDER BY room.create_at DESC
    LIMIT ? OFFSET ?`,
    params: [limit || COUNT_ROOM, startIndex]
  }
}

function getSelectRoomsJoined ({ userId }) {
  return {
    sql: `
    SELECT room.id, room.pw, room.create_by AS createBy, room.title, room.max_join AS maxJoin, room.description, room.create_at AS createAt, room.update_at AS updateAt, room.joining
    FROM member
    LEFT JOIN (
      SELECT room.id, room.pw, room.create_by, room.title, room.max_join, room.description, room.create_at, room.update_at, COUNT(CASE WHEN member.socket_id IS NOT NULL THEN 1 END) AS joining
      FROM room
      LEFT JOIN member ON member.room_id=room.id
      GROUP BY room.id
      ORDER BY room.create_at DESC
    ) AS room ON room.id = member.room_id
    WHERE member.user_id=?
    ORDER BY member.last_joined DESC`,
    params: [userId]
  }
}
function getSelectRoomsByTitle ({ title }) {
  return {
    sql: `
    SELECT room.id, room.pw, room.create_by AS createBy, room.title, room.max_join AS maxJoin, room.description, room.create_at AS createAt, room.update_at AS updateAt, COUNT(CASE WHEN member.socket_id IS NOT NULL THEN 1 END) AS joining
    FROM room
    LEFT JOIN member ON member.room_id=room.id
    WHERE room.title LIKE ?
    GROUP BY room.id
    ORDER BY room.create_at DESC
    `,
    params: [`%${title}%`]
  }
}

function getSelectRoom ({ id }) {
  return {
    sql: `
    SELECT room.id, room.create_by AS createBy, room.title, room.pw, room.max_join AS maxJoin, room.description, room.create_at AS createAt, room.update_at AS updateAt, COUNT(CASE WHEN member.socket_id IS NOT NULL THEN 1 END) AS joining
    FROM room
    LEFT JOIN member ON member.room_id=room.id
    WHERE room.id=?
    GROUP BY room.id
  `,
    params: [id]
  }
}

function getInsertRoom ({ createBy, title, pw, maxJoin, description }) {
  return {
    sql: `
    INSERT INTO room (create_by, title, pw, max_join, description) VALUES
    (?, ?, ?, ?, ?)`,
    params: [createBy, title, pw, maxJoin, description]
  }
}

function getSelectInsertedRoom () {
  return {
    sql: `
    SELECT room.id, room.create_by AS createBy, room.title, room.pw, room.max_join AS maxJoin, room.description, room.create_at AS createAt, room.update_at AS updateAt, COUNT(CASE WHEN member.socket_id IS NOT NULL THEN 1 END) AS joining
    FROM room
    LEFT JOIN member ON member.room_id=room.id
    WHERE room.id=@id
    GROUP BY room.id`,
    params: []
  }
}

function getUpdateRoom ({ id, title, pw, maxJoin, description }) {
  return {
    sql: `
    UPDATE room SET
      title=?,
      pw=?,
      max_join=?,
      description=?
    WHERE id=?`,
    params: [title, pw, maxJoin, description, id]
  }
}

function getDeleteRoom ({ id }) {
  return {
    sql: `
    DELETE FROM room
    WHERE id=?
    `,
    params: [id]
  }
}

// for member
function getSelectAlreadyMember ({ userId, roomId }) {
  return {
    sql: `
    SELECT COUNT(*) AS length
    FROM member
    WHERE user_id=? AND room_id=?`,
    params: [userId, roomId]
  }
}
function getSelectMember ({ userId, roomId }) {
  return {
    sql: `
    SELECT socket_id AS socketId
    FROM member
    WHERE user_id=? AND room_id=?`,
    params: [userId, roomId]
  }
}
function getSelectOnlineMembersInRoom ({ roomId }) {
  return {
    sql: `
    SELECT user.id, user.name, user.email, user.phone
    FROM member
    LEFT JOIN user ON member.user_id=user.id
    WHERE member.room_id=? AND member.socket_id IS NOT NULL`,
    params: [roomId]
  }
}
function getSelectMemberJoining ({ socketId }) {
  return {
    sql: `
    SELECT room_id AS roomId
    FROM member
    WHERE socket_id=?`,
    params: [socketId]
  }
}
function getInsertMember ({ userId, roomId, socketId }) {
  return {
    sql: `
    INSERT INTO member (user_id, room_id, socket_id)
    VALUES (?, ?, ?)`,
    params: [userId, roomId, socketId]
  }
}
function getUpdateMember ({ userId, roomId, socketId }) {
  return {
    sql: `
    UPDATE member
    SET socket_id=?
    WHERE user_id=? AND room_id=?`,
    params: [socketId, userId, roomId]
  }
}
function getUpdateMemberOffline ({ socketId }) {
  return {
    sql: `
    UPDATE member
    SET socket_id=NULL
    WHERE socket_id=?`,
    params: [socketId]
  }
}

// for message
function getSelectCountMessageInRoom ({ userId, roomId }) {
  return {
    sql: `
    SELECT COUNT(message_for_user.message_id) AS length
    FROM (
      SELECT message_id
      FROM room_message
      WHERE room_id=?
      UNION
      SELECT group_message.message_id
      FROM group_message
      LEFT JOIN message ON message.id=group_message.message_id
      WHERE group_message.room_id=? AND (message.writter=? OR group_message.user_id=?)
    ) AS message_for_user`,
    params: [roomId, roomId, userId, userId]
  }
}

function getSelectMessagesInRoom ({ userId, roomId, limit, offset }) {
  return {
    sql: `
    SELECT message.id, message_type.type, user.name AS writter, message.content, message.write_at AS writeAt
    FROM (
      SELECT message_id
      FROM room_message
      WHERE room_id=?
      UNION
      SELECT group_message.message_id
      FROM group_message
      LEFT JOIN message ON message.id=group_message.message_id
      WHERE group_message.room_id=? AND (message.writter=? OR group_message.user_id=?)
    ) AS message_for_user
    LEFT JOIN message ON message_for_user.message_id=message.id
    LEFT JOIN message_type ON message.type_id=message_type.id
    LEFT JOIN user ON message.writter=user.id
    ORDER BY message.write_at
    LIMIT ? OFFSET ?`,
    params: [roomId, roomId, userId, userId, limit, offset]
  }
}

function getSelectMessagesInRoomReconnect ({ userId, roomId, startIndex }) {
  return {
    sql: `
    SELECT message.id, message_type.type, user.name AS writter, message.content, message.write_at AS writeAt
    FROM (
      SELECT message_id
      FROM room_message
      WHERE room_id=?
      UNION
      SELECT group_message.message_id
      FROM group_message
      LEFT JOIN message ON message.id=group_message.message_id
      WHERE group_message.room_id=? AND (message.writter=? OR group_message.user_id=?)
    ) AS message_for_user
    LEFT JOIN message ON message_for_user.message_id=message.id
    LEFT JOIN message_type ON message.type_id=message_type.id
    LEFT JOIN user ON message.writter=user.id
    ORDER BY message.write_at
    LIMIT ${Number.MAX_SAFE_INTEGER} OFFSET ?`,
    params: [roomId, roomId, userId, userId, startIndex]
  }
}

function getSelectMessage ({ id }) {
  return {
    sql: `
    SELECT message.id, message_type.type, user.name AS writter, message.content, message.write_at AS writeAt
    FROM message
    LEFT JOIN message_type ON message_type.id=message.type_id
    LEFT JOIN user ON message.writter=user.id
    WHERE message.id=?`,
    params: [id]
  }
}
function getSelectMessageRecipients ({ messageId }) {
  return {
    sql: `
    SELECT user_id AS userId
    FROM group_message
    WHERE message_id=?`,
    params: [messageId]
  }
}

function getInsertMessage ({ type, writter, content }) {
  return {
    sql: `
    INSERT INTO message (type_id, writter, content)
    VALUES ((SELECT id FROM message_type WHERE type=?), ?, ?)`,
    params: [type, writter, content]
  }
}

function getSelectInsertedMessage () {
  return {
    sql: `
    SELECT message.id, message_type.type, user.name AS writter, message.content, message.write_at AS writeAt
    FROM message
    LEFT JOIN message_type ON message_type.id=message.type_id
    LEFT JOIN user ON message.writter=user.id
    WHERE message.id=@id`,
    params: []
  }
}

function getInsertRoomMessage ({ roomId }) {
  return {
    sql: `
    INSERT INTO room_message (message_id, room_id)
    VALUES (@id, ?)`,
    params: [roomId]
  }
}

function getInsertGroupMessages ({ roomId, recipients }) {
  return {
    sql: `
    INSERT INTO group_message (message_id, room_id, user_id)
    VALUES ${new Array(recipients.length).fill('(@id, ?, ?)').join(',')}`,
    params: recipients.reduce((bucket, userId) => [...bucket, roomId, userId], [])
  }
}

export {
  // for utils
  getSelectLastInsertId,
  getSetId,

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
  getCreateTableFileInfo,

  // for online
  getSelectOnlineUsers,
  getSelectOfflineUsers,
  getSelectUserAlreadyOnline,
  getInsertOnlineUser,
  getDeleteOnlineUser,

  // for user
  getSelectCountUser,
  getSelectUserIsValid,
  getSelectUserBySocketId,
  getSelectUserById,
  getInsertUser,

  // for room
  getSelectRooms,
  getSelectRoomsJoined,
  getSelectRoomsByTitle,
  getSelectRoom,
  getInsertRoom,
  getSelectInsertedRoom,
  getUpdateRoom,
  getDeleteRoom,

  // for member
  getSelectAlreadyMember,
  getSelectMember,
  getSelectOnlineMembersInRoom,
  getSelectMemberJoining,
  getInsertMember,
  getUpdateMember,
  getUpdateMemberOffline,

  // for message
  getSelectCountMessageInRoom,
  getSelectMessagesInRoom,
  getSelectMessagesInRoomReconnect,
  getSelectMessage,
  getSelectMessageRecipients,
  getInsertMessage,
  getSelectInsertedMessage,

  getInsertRoomMessage,
  getInsertGroupMessages
}
