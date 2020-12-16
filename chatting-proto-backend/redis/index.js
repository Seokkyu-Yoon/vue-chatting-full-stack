const Redis = require('ioredis');
const messageFileManager = require('./message-file-manager');

const redis = new Redis();
const messagesDir = `${__dirname}/../messages`;

function getFormattedTime(date) {
  let hours = date.getHours();
  let noonFlag = 'AM';
  if (hours > 12) {
    hours -= 12;
    noonFlag = 'PM';
  }
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${noonFlag} ${hours}:${minutes}`;
}

function extractDate(date = new Date()) {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    date: date.getDate(),
  };
}

function isAnotherDate(date1, date2) {
  const extract1 = extractDate(date1);
  const extract2 = extractDate(date2);
  if (extract1.year !== extract2.year) return true;
  if (extract1.month !== extract2.month) return true;
  if (extract1.date !== extract2.date) return true;
  return false;
}

function getMessagesPath(roomKey) {
  return `${messagesDir}/${roomKey}.json`;
}

function getMessages(roomKey) {
  const messagesPath = getMessagesPath(roomKey);
  return messageFileManager.get(messagesPath);
}

async function messageToJson(roomKey, message) {
  const messagesPath = getMessagesPath(roomKey);
  messageFileManager.push(messagesPath, message);
  // fs.writeFileSync(messagesPath, JSON.stringify(messages, null, 2));
}

async function addUser(socketId, userName) {
  await redis.multi()
    .sadd('users', socketId)
    .set(`user:${socketId}`, userName)
    .exec((e) => {
      if (e === null) return;
      throw new Error(e);
    });
}

async function deleteUser(socketId) {
  await redis.multi()
    .srem('users', socketId)
    .del(`user:${socketId}`)
    .exec((e) => {
      if (e === null) return;
      throw new Error(e);
    });
}

async function getSocketIds() {
  const socketIds = await redis.smembers('users');
  return socketIds;
}

async function getUserName(socketId) {
  const userName = await redis.get(`user:${socketId}`);
  return userName;
}

async function checkLastUpdated(roomKey) {
  const now = new Date();
  const lastUpdated = await redis.get(`room:${roomKey}:lastUpdated`);
  if (!isAnotherDate(now, new Date(lastUpdated))) return;

  const { year, month, date } = extractDate(now);
  const text = `${year}년 ${month}월 ${date}일`;

  const message = {
    type: 'time',
    text,
  };
  await messageToJson(roomKey, message);
}

async function writeMessage({
  type,
  userName,
  roomKey,
  text = '',
} = {}) {
  await checkLastUpdated(roomKey);

  const now = new Date();
  const time = getFormattedTime(now);

  const message = {
    type,
    userName,
    text,
    time,
  };
  await redis.set(`room:${roomKey}:lastUpdated`, now);
  await messageToJson(roomKey, message);
}

async function joinRoom({ userName, roomKey } = {}) {
  await writeMessage({
    type: 'join',
    userName,
    roomKey,
  });
}

async function createRoom({ roomKey, roomName } = {}) {
  const lastUpdated = new Date();
  lastUpdated.setDate(0);

  await redis.multi()
    .sadd('rooms', roomKey)
    .set(`room:${roomKey}:name`, roomName)
    .set(`room:${roomKey}:lastUpdated`, lastUpdated)
    .exec((e) => {
      if (e === null) return;
      throw new Error(e);
    });
  await messageToJson(roomKey);
}

async function leaveRoom({ userName, roomKey } = {}) {
  await writeMessage({
    type: 'leave',
    userName,
    roomKey,
  });
}

async function existsRoom({ roomKey } = {}) {
  const rooms = messageFileManager.allRooms(messagesDir);
  return rooms.includes(roomKey);
}

async function getRoom({ roomKey = '' } = {}) {
  if (typeof roomKey !== 'string') return null;
  if (roomKey !== '') {
    const roomName = await redis.get(`room:${roomKey}:name`);
    const roomLastUpdated = await redis.get(`room:${roomKey}:lastUpdated`);
    const room = {
      roomName,
      roomLastUpdated,
    };
    return room;
  }

  const radisRoomKeys = await redis.smembers('rooms');
  const roomMap = {};
  await Promise.all(
    radisRoomKeys.map(async (radisRoomKey) => {
      const roomName = await redis.get(`room:${radisRoomKey}:name`);
      const roomLastUpdated = await redis.get(`room:${radisRoomKey}:lastUpdated`);
      const room = {
        roomName,
        roomLastUpdated,
      };
      roomMap[radisRoomKey] = room;
    }),
  );
  return roomMap;
}

module.exports = {
  addUser,
  deleteUser,
  getUserName,
  getSocketIds,

  writeMessage,
  createRoom,
  joinRoom,
  leaveRoom,
  existsRoom,

  getRoom,
  getMessages,
};
