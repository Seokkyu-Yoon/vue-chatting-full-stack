const SocketIo = require('socket.io');
const debug = require('debug')('chatting-proto-backend:server');
const roomManager = require('../room');
const userManager = require('../user');

function PluginSocketIo() {
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
    userManager.connect(socket.id);
    socket.on('disconnect', this.disconnect.bind(this, socket));
    socket.on('create', this.create.bind(this, socket));
    socket.on('join', this.join.bind(this, socket));
    socket.on('leave', this.leave.bind(this, socket));
    socket.on('write', this.write.bind(this, socket));
  });
};
PluginSocketIo.prototype.create = function create(socket, { userName }) {
  debug(`${socket.id} create user '${userName}'`);
  userManager.create(socket.id, userName);
  this.onUsersChanged();
};
PluginSocketIo.prototype.join = function join(socket, { roomKey }) {
  const userName = userManager.userMap[socket.id].name;
  debug(`${userName} join room of '${roomKey}'`);
  socket.join(roomKey);
  roomManager.join(socket.id, userName, roomKey);
  userManager.join(socket.id, roomKey);
  this.onMessage(roomKey);
};
PluginSocketIo.prototype.leave = function leave(socket, { roomKey }) {
  const userName = userManager.userMap[socket.id].name;
  debug(`${userName} leave room of '${roomKey}'`);
  socket.leave(roomKey);
  if (roomManager.leave(socket.id, userName, roomKey)) {
    console.log(`${roomKey} destroied`);
    this.onRoomsChanged();
  }
  this.onMessage(roomKey);
};
PluginSocketIo.prototype.write = function write(socket, { roomKey, text }) {
  const userName = userManager.userMap[socket.id].name;
  debug(`- user: ${userName}\n- room: ${roomKey}\n- text\n${text}\n`);
  roomManager.write(userName, roomKey, text);
  this.onMessage(roomKey);
};
PluginSocketIo.prototype.disconnect = function disconnect(socket) {
  const user = userManager.userMap[socket.id];
  debug(`${socket.id}(${user.name}) exit`);
  console.log(user);
  user.roomKeys.forEach((roomKey) => {
    if (roomManager.leave(socket.id, user.name, roomKey)) {
      console.log(`${roomKey} destroied`);
      this.onRoomsChanged();
    }
  });
  userManager.disconnect(socket.id);
  this.onUsersChanged();
};
PluginSocketIo.prototype.onUsersChanged = function onUsersChanged() {
  this.io.sockets.emit('user-changed', Object.keys(userManager.userMap).reduce((bucket, socketId) => {
    const user = userManager.userMap[socketId];
    if (user.name === '') return bucket;
    bucket[socketId] = user;
    return bucket;
  }, {}));
};
PluginSocketIo.prototype.onRoomsChanged = function onRoomsChanged() {
  this.io.sockets.emit('room-changed', roomManager.roomMap);
};
PluginSocketIo.prototype.onMessage = function onMessage(roomKey) {
  this.io.to(roomKey).emit('message', roomKey);
};

module.exports = PluginSocketIo;
