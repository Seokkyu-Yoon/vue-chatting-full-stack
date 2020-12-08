const fs = require('fs');
const Room = require('./room');

const roomRootPath = `${__dirname}/../storage/rooms`;

function createKey() {
  return `0x${Math.random().toString(16).slice(2, 10)}`;
}

function RoomManager() {
  this.roomMap = {};
  this.load();
}
RoomManager.prototype.load = function load() {
  fs.readdirSync(roomRootPath).forEach((roomKey) => {
    const savedRoom = JSON.parse(fs.readFileSync(`${roomRootPath}/${roomKey}`));
    if (savedRoom.tokens.length > 0) {
      this.roomMap[roomKey.replace('.json', '')] = new Room(savedRoom);
    }
  });
};
RoomManager.prototype.updateReport = function updateRoom(roomKey) {
  const room = this.roomMap[roomKey];
  fs.writeFileSync(room.getRoomPath(), JSON.stringify(room.getSafetyData(), null, 4));
};

RoomManager.prototype.create = function create(roomName) {
  let roomKey = createKey();
  while (Object.keys(this.roomMap).includes(roomKey)) {
    roomKey = createKey();
  }
  this.roomMap[roomKey] = new Room({ roomKey, roomName });
  return roomKey;
};
RoomManager.prototype.destroy = function destroy(roomKey) {
  delete this.roomMap[roomKey];
};
RoomManager.prototype.onMessage = function onMessage(userName, roomKey, text) {
  this.roomMap[roomKey].onMessage({
    userName,
    text,
  });
  this.updateReport(roomKey);
};
RoomManager.prototype.join = function join(token, userName, roomKey) {
  this.roomMap[roomKey].join(token, userName);
  this.updateReport(roomKey);
};
RoomManager.prototype.leave = function leave(token, userName, roomKey) {
  if (typeof this.roomMap[roomKey] === 'undefined') return;
  this.roomMap[roomKey].leave(token, userName);
  this.updateReport(roomKey);

  if (this.roomMap[roomKey].tokens.size === 0) {
    this.destroy(roomKey);
  }
};
RoomManager.prototype.isDestroy = function isDestroy(roomKey) {
  return typeof this.roomMap[roomKey] === 'undefined';
};

module.exports = RoomManager;
