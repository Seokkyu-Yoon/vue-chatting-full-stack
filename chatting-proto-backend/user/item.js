function User() {
  this.name = '';
  this.roomKeys = [];
}

User.prototype.create = function create(userName) {
  this.name = userName;
};
User.prototype.join = function join(roomKey) {
  this.roomKeys.push(roomKey);
};
User.prototype.leave = function leave(roomKey) {
  const keyIndex = this.roomKeys.findIndex((value) => value === roomKey);
  if (keyIndex > -1) {
    this.roomKeys = [
      ...this.roomKeys.slice(0, keyIndex),
      ...this.roomKeys.slice(keyIndex + 1),
    ];
  }
};

module.exports = User;
