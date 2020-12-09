function User({ userName, roomKeys = [] }) {
  this.userName = userName;
  this.roomKeys = new Set(roomKeys);
}
User.prototype.joinRoom = function joinRoom(roomKey) {
  this.roomKeys.add(roomKey);
};
User.prototype.leaveRoom = function leaveRoom(roomKey) {
  this.roomKeys.delete(roomKey);
};
User.prototype.serialize = function serialize() {
  return {
    userName: this.userName,
    roomKeys: [...this.roomKeys],
  };
};

module.exports = User;
