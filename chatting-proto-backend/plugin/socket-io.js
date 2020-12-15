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

  async function sendUsers(socket = null) {
    const users = {};
    await io.of('/').adapter.nsp.sockets.forEach(({ id, userName }) => {
      if (typeof userName !== 'string') return;
      users[id] = { userName };
    });
    if (socket === null) {
      emitter.broadcast.emit(Event.User.LIST, users);
    } else {
      socket.emit(Response.User.LIST, users);
    }
  }

  async function sendRooms(socket = null) {
    const rooms = await redis.getRoom();
    const roomsWithSockets = Object.keys(rooms).reduce((bucket, roomKey) => {
      const roomSockets = io.of('/').adapter.rooms.get(roomKey) || new Set();
      if (roomSockets.size === 0) {
        return bucket;
      }

      const room = {};
      room[roomKey] = rooms[roomKey];
      room[roomKey].sockets = [...roomSockets];
      return {
        ...bucket,
        ...room,
      };
    }, {});

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
    debug(`${socket.id} join`);
    const roomKeys = new Set();
    if (roomKey !== null) {
      io.of('/').adapter.remoteJoin(socket.id, roomKey);
      roomKeys.add(roomKey);
      await sendRooms();
    }
    Object.assign(socket, { userName });
    sockets[socket.id] = { userName, roomKeys };
    await sendUsers();
  }

  async function writeMessage(socket, { roomKey, text }) {
    await redis.writeMessage({
      type: 'message',
      userName: socket.userName,
      roomKey,
      text,
    });
    await sendMessage(null, { roomKey });
  }

  async function joinRoom(socket, { roomKey }) {
    debug(`${socket.userName} join ${roomKey}`);
    await redis.joinRoom({ userName: socket.userName, roomKey });
    io.of('/').adapter.remoteJoin(socket.id, roomKey);
    sockets[socket.id].roomKeys.add(roomKey);
    await sendUsers();
    await sendRooms();
    await sendMessage(null, { roomKey });
  }

  async function createRoom(socket, { roomName }) {
    debug(`${socket.userName} create room`);
    const roomKey = await makeRoomKey();
    await redis.createRoom({ roomKey, roomName });
    await joinRoom(socket, { roomKey });
    await sendRooms();
    socket.emit(Response.Room.CREATE, roomKey);
  }

  async function leaveRoom(socket, { roomKey }) {
    debug(`${socket.userName} leave ${roomKey}`);
    await redis.leaveRoom({ userName: socket.userName, roomKey });
    sockets[socket.id].roomKeys.delete(roomKey);
    if (socket.rooms.has(roomKey)) {
      io.of('/').adapter.remoteLeave(socket.id, roomKey);
    }
    await sendUsers();
    await sendRooms();
    await sendMessage(null, { roomKey });
  }

  async function disconnect(socket) {
    debug(`${socket.id} has disconnect`);
    console.log(sockets);
    if (typeof sockets[socket.id] === 'undefined') return;

    const { roomKeys } = sockets[socket.id];
    await Promise.all(
      [...roomKeys].map(async (roomKey) => {
        await leaveRoom(socket, { roomKey });
      }),
    );

    delete sockets[socket.id];
    await sendUsers();
  }

  async function connection(socket) {
    debug(`${socket.id} has connect`);
    socket.on(Event.User.LIST, sendUsers.bind(null));
    socket.on(Event.Room.LIST, sendRooms.bind(null));
    socket.on(Event.Room.MESSAGES, sendMessage.bind(null, null));

    socket.on(Request.User.LIST, sendUsers.bind(null, socket));
    socket.on(Request.User.LOGIN, loginUser.bind(null, socket));

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
