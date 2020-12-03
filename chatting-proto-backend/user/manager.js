const Item = require('./item');

function Manager() {
  this.userMap = {};
}

Manager.prototype.connect = function connect(socketId) {
  this.userMap[socketId] = new Item();
};
Manager.prototype.create = function create(socketId, userName) {
  this.userMap[socketId].create(userName);
};
Manager.prototype.disconnect = function disconnect(socketId) {
  delete this.userMap[socketId];
  console.log(this.userMap);
};
Manager.prototype.join = function join(socketId, roomKey) {
  this.userMap[socketId].join(roomKey);
};
Manager.prototype.leave = function leave(socketId, roomKey) {
  this.userMap[socketId].leave(roomKey);
};

module.exports = Manager;
