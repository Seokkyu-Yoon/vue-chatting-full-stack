const debug = require('debug')('chatting-proto-backend:server:socket');

const socketIo = require('socket.io');
const socketIoRedis = require('socket.io-redis');
const socketIoEmitter = require('socket.io-emitter');

const {
  CONNECTION,
  DISCONNECT,
  Event,
  Response,
  Request,
} = require('./interface');

const Config = {
  SocketIo: {
    cors: {
      origin: '*',
      method: ['GET', 'POST'],
    },
  },
  Redis: {
    host: 'localhost',
    port: 6379,
  },
};

const emitter = socketIoEmitter(Config.Redis);

async function getTrashUsers(currSocketIds = [], redisSocketIds = []) {
  const trashUsersSet = new Set(redisSocketIds);
  await Promise.all(currSocketIds.map(async (socketId) => {
    trashUsersSet.delete(socketId);
  }));
  return [...trashUsersSet];
}
function activate(server, redis) {
  const sockets = {};

  function getBase36RandomStr() {
    return Math.random().toString(36).substring(2, 15);
  }
  async function getRandomHash() {
    return `${getBase36RandomStr()}${getBase36RandomStr()}`;
  }
  async function makeRoomKey() {
    let roomKey = await getRandomHash();
    // eslint-disable-next-line no-await-in-loop
    while (await redis.existsRoom({ roomKey })) {
    // eslint-disable-next-line no-await-in-loop
      roomKey = await getRandomHash();
    }
    return roomKey;
  }

  debug('activate socket.io');
  const io = socketIo(server, Config.SocketIo);
  io.adapter(socketIoRedis(Config.Redis));

  async function sendUsers(socket = null, { roomKey = null } = {}) {
    const users = {};
    const socketIds = await io.of('/').adapter.sockets(roomKey === null ? [] : [roomKey]);
    await Promise.all([...socketIds].map(async (socketId) => {
      const userName = await redis.getUserName(socketId);
      if (userName === null) return;
      users[socketId] = { userName };
    }));

    Object.keys(users).sort().reduce((bucket, socketId) => {
      const temp = {};
      temp[socketId] = users[socketId];
      return {
        ...bucket,
        ...temp,
      };
    }, {});
    if (socket !== null) {
      socket.emit(Response.User.LIST, users);
      return;
    }
    if (roomKey !== null) {
      emitter.in(roomKey).emit(Response.User.LIST, users);
      return;
    }
    const currSocketIds = Object.keys(users);
    const redisSocketIds = await redis.getSocketIds();
    const trashUsers = await getTrashUsers(currSocketIds, redisSocketIds);
    emitter.broadcast.emit(Event.User.LIST, users);

    await Promise.all(
      trashUsers.map(async (socketId) => {
        await redis.deleteUser(socketId);
        if (sockets[socketId]) {
          delete sockets[socketId];
        }
      }),
    );
  }

  async function sendRooms(socket = null) {
    const rooms = await redis.getRoom();
    const roomsWithSockets = {};
    await Promise.all(Object.keys(rooms).map(async (roomKey) => {
      const roomSockets = (await io.of('/').adapter.sockets([roomKey])) || new Set();
      // if (roomSockets.size === 0) {
      //   return;
      // }
      roomsWithSockets[roomKey] = {
        ...rooms[roomKey],
        sockets: [...roomSockets],
      };
    }));

    if (socket === null) {
      emitter.broadcast.emit(Event.Room.LIST, roomsWithSockets);
    } else {
      socket.emit(Response.Room.LIST, roomsWithSockets);
    }
  }

  async function sendMessage(socket = null, { roomKey = '' } = {}) {
    const messages = await redis.getMessages(roomKey);
    if (socket === null) {
      emitter.to(roomKey).emit(Event.Room.MESSAGES, messages);
      return;
    }
    socket.emit(Response.Room.MESSAGES, messages);
  }

  async function loginUser(socket, { userName, roomKey = null }) {
    debug(`${socket.id} login`);
    const roomKeys = new Set();
    if (roomKey !== null) {
      await io.of('/').adapter.remoteJoin(socket.id, roomKey);
      roomKeys.add(roomKey);
      await sendRooms();
    }
    await redis.addUser(socket.id, userName);
    sockets[socket.id] = roomKeys;
    await sendUsers(null, { roomKey });
  }

  async function isValidUser(socket, { userName = '' } = {}) {
    if (userName === '') {
      socket.emit(Response.User.VALID, false);
      return;
    }
    const socketIds = await io.of('/').adapter.sockets([]);
    // eslint-disable-next-line no-restricted-syntax
    for (const socketId of [...socketIds]) {
      // eslint-disable-next-line no-await-in-loop
      const redisUserName = await redis.getUserName(socketId);
      if (redisUserName === userName) {
        socket.emit(Response.User.VALID, false);
        return;
      }
    }
    socket.emit(Response.User.VALID, true);
  }

  async function writeMessage(socket, { roomKey, text }) {
    const userName = await redis.getUserName(socket.id);
    await redis.writeMessage({
      type: 'message',
      userName,
      roomKey,
      text,
    });
    await sendMessage(null, { roomKey });
  }

  async function joinRoom(socket, { roomKey }) {
    const userName = await redis.getUserName(socket.id);
    debug(`${userName} join ${roomKey}`);
    await redis.joinRoom({ userName, roomKey });
    io.of('/').adapter.remoteJoin(socket.id, roomKey);
    sockets[socket.id].add(roomKey);
    await sendUsers(null, { roomKey });
    await sendRooms();
    await sendMessage(null, { roomKey });
  }

  async function createRoom(
    socket,
    {
      roomName,
      roomPassword,
      roomMaxJoin,
      roomDesc,
    },
  ) {
    const userName = await redis.getUserName(socket.id);
    debug(`${userName} create room`);
    const roomKey = await makeRoomKey();
    await redis.createRoom(
      {
        userName,
        roomKey,
        roomName,
        roomPassword,
        roomMaxJoin,
        roomDesc,
      },
    );
    await joinRoom(socket, { roomKey });
    await sendRooms();
    socket.emit(Response.Room.CREATE, roomKey);
  }

  async function leaveRoom(socket, { roomKey }) {
    const userName = await redis.getUserName(socket.id);
    debug(`${userName} leave ${roomKey}`);
    await redis.leaveRoom({ userName, roomKey });
    sockets[socket.id].delete(roomKey);
    if (socket.rooms.has(roomKey)) {
      io.of('/').adapter.remoteLeave(socket.id, roomKey);
    }
    await sendUsers(null, { roomKey });
    await sendRooms();
    await sendMessage(null, { roomKey });
  }

  async function deleteRoom(socket, { roomKey }) {
    const userName = await redis.getUserName(socket.id);
    debug(`${userName} delete ${roomKey}`);
  }

  async function disconnect(socket) {
    debug(`${socket.id} has disconnect`);
    if (typeof sockets[socket.id] === 'undefined') return;

    const roomKeys = sockets[socket.id];
    await Promise.all(
      [...roomKeys].map(async (roomKey) => {
        await leaveRoom(socket, { roomKey });
      }),
    );
    await redis.deleteUser(socket.id);
    delete sockets[socket.id];
    await sendUsers(null);
  }

  async function connection(socket) {
    debug(`${socket.id} has connect`);
    socket.on(Event.User.LIST, sendUsers.bind(null, null));
    socket.on(Event.Room.LIST, sendRooms.bind(null));
    socket.on(Event.Room.MESSAGES, sendMessage.bind(null, null));

    socket.on(Request.User.LIST, sendUsers.bind(null, socket));
    socket.on(Request.User.LOGIN, loginUser.bind(null, socket));
    socket.on(Request.User.VALID, isValidUser.bind(null, socket));

    socket.on(Request.Room.LIST, sendRooms.bind(null, socket));
    socket.on(Request.Room.JOIN, joinRoom.bind(null, socket));
    socket.on(Request.Room.CREATE, createRoom.bind(null, socket));
    socket.on(Request.Room.LEAVE, leaveRoom.bind(null, socket));
    socket.on(Request.Room.WRITE, writeMessage.bind(null, socket));
    socket.on(Request.Room.MESSAGES, sendMessage.bind(null, socket));

    socket.on(DISCONNECT, disconnect.bind(null, socket));
  }

  io.on(CONNECTION, connection);
}

module.exports = activate;
