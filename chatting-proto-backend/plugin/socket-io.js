const SocketIo = require('socket.io');
const debug = require('debug')('chatting-proto-backend:server');
const roomManager = require('../room');
const userManager = require('../user');

function PluginSocketIo() {
  this.socketMap = {};
  this.config = {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  };
}

PluginSocketIo.prototype.activate = function activate(server) {
  debug('activate socket.io');
  this.io = SocketIo(server, this.config);
  this.io.on('connection', (socket) => {
    debug(`${socket.id} has connected`);
    this.resRoomList(socket);
    this.resUserList(socket);
    socket.on('disconnect', this.disconnect.bind(this, socket));

    socket.on('event:user:list', this.eventUserList.bind(this));
    socket.on('req:user:list', this.resUserList.bind(this, socket));
    socket.on('req:user:create', this.userCreate.bind(this, socket));
    socket.on('req:user:join', this.userJoin.bind(this, socket));

    socket.on('event:room:list', this.eventRoomList.bind(this));
    socket.on('req:room:list', this.resRoomList.bind(this, socket));
    socket.on('req:room:create', this.roomCreate.bind(this, socket));
    socket.on('req:room:join', this.roomJoin.bind(this, socket));
    socket.on('req:room:leave', this.roomLeave.bind(this, socket));
    socket.on('req:room:message', this.roomMessage.bind(this, socket));
  });

  setTimeout(() => {
    const sockets = [...this.io.sockets.sockets.values()];
    const socketTokens = sockets.map(({ token }) => token);
    const savedTokens = Object.keys(userManager.userMap);

    const disconnectTokens = savedTokens.filter((savedToken) => !socketTokens.includes(savedToken));
    disconnectTokens.forEach((disconnectToken) => {
      userManager.destroy(disconnectToken);
    });
    this.eventUserList();

    const roomKeys = Object.keys(roomManager.roomMap);
    roomKeys.forEach((roomKey) => {
      const room = roomManager.roomMap[roomKey];
      const roomTokens = [...room.tokens];
      roomTokens.forEach((tokenOfRoom) => {
        if (!socketTokens.includes(tokenOfRoom)) {
          const roomMessages = room.messages;
          for (let messageIndex = roomMessages.length - 1; messageIndex > -1; messageIndex -= 1) {
            const { token, userName } = roomMessages[messageIndex];
            if (token === tokenOfRoom) {
              roomManager.leave(tokenOfRoom, userName, roomKey);
              break;
            }
          }
        }
      });
    });
    this.eventRoomList();
  }, 5000);
};
PluginSocketIo.prototype.userCreate = function userCreate(socket, { token, userName }) {
  debug(`${token} create user '${userName}'`);
  userManager.create(token, userName);
  this.userJoin(socket, { token });
  this.eventUserList();
};
PluginSocketIo.prototype.userJoin = function userJoin(socket, { token }) {
  debug(`${socket.id} join with '${token}'`);
  Object.assign(socket, { token });
  if (typeof userManager.userMap[token] === 'undefined') return;
  const userRoomKeySets = userManager.get(token).roomKeys;
  [...userRoomKeySets].forEach((roomKey) => {
    socket.join(roomKey);
  });
};
PluginSocketIo.prototype.roomCreate = function roomCreate(socket, { roomName }) {
  const { userName } = userManager.get(socket.token);
  debug(`${userName} create room`);
  const roomKey = roomManager.create(roomName);
  this.eventRoomList();
  this.resRoomCreate(socket, roomKey);
  this.roomJoin(socket, { token: socket.token, userName, roomKey });
};
PluginSocketIo.prototype.roomJoin = function roomJoin(socket, { roomKey }) {
  const { userName } = userManager.get(socket.token);
  debug(`${userName} join room of '${roomKey}'`);
  userManager.joinRoom(socket.token, roomKey);
  roomManager.join(socket.token, userName, roomKey);
  socket.join(roomKey);
  this.resRoomMessages(roomKey);
};
PluginSocketIo.prototype.roomLeave = function roomLeave(socket, { roomKey }) {
  const { userName } = userManager.get(socket.token);
  debug(`${userName} leave room of '${roomKey}'`);
  userManager.leaveRoom(socket.token, roomKey);
  roomManager.leave(socket.token, userName, roomKey);
  socket.leave(roomKey);
  if (roomManager.isDestroy(roomKey)) {
    debug(`${roomKey} has destroied`);
    this.eventRoomList();
  } else {
    this.resRoomMessages(roomKey);
  }
};
PluginSocketIo.prototype.roomMessage = function roomMessage(socket, { roomKey, text }) {
  const { userName } = userManager.get(socket.token);
  // debug(`- user: ${userName}\n- room: ${roomKey}\n- text\n${text}\n`);
  roomManager.onMessage(userName, roomKey, text);
  this.resRoomMessages(roomKey);
};
PluginSocketIo.prototype.disconnect = function disconnect(socket) {
  const { token } = socket;
  if (typeof token === 'undefined') return;

  const user = userManager.get(token);
  if (typeof user === 'undefined') return;

  debug(`${token} exit`);
  user.roomKeys.forEach((roomKey) => {
    this.roomLeave(socket, { userName: user.userName, roomKey });
  });
  userManager.destroy(token);
  this.eventUserList();
};
PluginSocketIo.prototype.eventUserList = function eventUserList() {
  this.io.sockets.emit('event:user:list', userManager.serialize());
};
PluginSocketIo.prototype.eventRoomList = function eventRoomList() {
  this.io.sockets.emit('event:room:list', roomManager.serialize());
};
PluginSocketIo.prototype.resUserList = function resUserList(socket) {
  this.io.to(socket.id).emit('res:user:list', userManager.serialize());
};
PluginSocketIo.prototype.resRoomList = function resRoomList(socket) {
  this.io.to(socket.id).emit('res:room:list', roomManager.serialize());
};
PluginSocketIo.prototype.resRoomCreate = function resRoomCreate(socket, roomKey) {
  this.io.to(socket.id).emit('res:room:create', roomKey);
};
PluginSocketIo.prototype.resRoomMessages = function resRoomMessages(roomKey) {
  this.io.to(roomKey).emit('res:room:messages', roomManager.roomMap[roomKey].messages);
};

module.exports = PluginSocketIo;
