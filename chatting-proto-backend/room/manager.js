const Item = require('./item');

function createKey() {
  return `0x${Math.random().toString(16).slice(2, 10)}`;
}

function Manager() {
  this.roomMap = {};
}

Manager.prototype.create = function create(roomName, key) {
  let roomKey = key || createKey();
  while (Object.keys(this.roomMap).includes(roomKey)) {
    roomKey = createKey();
  }
  this.roomMap[roomKey] = new Item(roomKey, roomName);
};
Manager.prototype.destroy = function destroy(roomKey) {
  delete this.roomMap[roomKey];
};
Manager.prototype.write = function write(userName, roomKey, text) {
  this.roomMap[roomKey].write({
    userName,
    text,
  });
};
Manager.prototype.join = function join(socketId, userName, roomKey) {
  this.roomMap[roomKey].join(socketId, userName);
};
Manager.prototype.leave = function leave(socketId, userName, roomKey) {
  let destroied = false;
  this.roomMap[roomKey].leave(socketId, userName);
  if (this.roomMap[roomKey].socketIds.length === 0) {
    this.destroy(roomKey);
    destroied = true;
  }
  return destroied;
};

module.exports = Manager;
