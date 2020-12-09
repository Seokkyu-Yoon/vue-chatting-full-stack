const fs = require('fs');
const User = require('./user');

const userPath = `${__dirname}/../storage/users.json`;

function UserManager() {
  this.userMap = {};
  this.init();
}
UserManager.prototype.init = function init() {
  if (!fs.existsSync(userPath)) return;

  const savedUsers = JSON.parse(fs.readFileSync(userPath));
  this.userMap = Object.keys(savedUsers).reduce((bucket, userToken) => {
    const savedUser = savedUsers[userToken];
    const temp = {};
    temp[userToken] = new User(savedUser);
    return {
      ...bucket,
      ...temp,
    };
  }, {});
};

UserManager.prototype.updateReport = function updateReport() {
  fs.writeFileSync(userPath, JSON.stringify(this.serialize(), null, 4));
};
UserManager.prototype.serialize = function serialize() {
  const userTokens = Object.keys(this.userMap);
  return userTokens.reduce((bucket, userToken) => {
    const temp = {};
    temp[userToken] = this.get(userToken).serialize();
    return {
      ...bucket,
      ...temp,
    };
  }, {});
};
UserManager.prototype.create = function create(token, userName) {
  this.userMap[token] = new User({ userName });
  this.updateReport();
};
UserManager.prototype.destroy = function destroy(token) {
  delete this.userMap[token];
  this.updateReport();
};
UserManager.prototype.joinRoom = function joinRoom(token, roomKey) {
  const user = this.get(token);
  user.joinRoom(roomKey);
  this.updateReport();
};
UserManager.prototype.leaveRoom = function leaveRoom(token, roomKey) {
  const user = this.get(token);
  user.leaveRoom(roomKey);
  this.updateReport();
};
UserManager.prototype.get = function get(token) {
  if (typeof token !== 'string') return this.userMap;
  return this.userMap[token];
};

module.exports = UserManager;
