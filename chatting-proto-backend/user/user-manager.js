const fs = require('fs');
const User = require('./user');

const userPath = `${__dirname}/../storage/users.json`;

function UserManager() {
  this.userMap = fs.existsSync(userPath) ? this.load() : {};
}
UserManager.prototype.load = function load() {
  const savedUsers = JSON.parse(fs.readFileSync(userPath));
  return Object.keys(savedUsers).reduce((bucket, userToken) => {
    const savedUser = savedUsers[userToken];
    const temp = {};
    temp[userToken] = new User(savedUser);
    Object.assign(bucket, temp);
    return bucket;
  }, {});
};
UserManager.prototype.updateReport = function updateReport() {
  fs.writeFileSync(userPath, JSON.stringify(this.getSafetyData(), null, 4));
};
UserManager.prototype.getSafetyData = function getSafetyData() {
  const userTokens = Object.keys(this.userMap);
  return userTokens.reduce((bucket, userToken) => {
    const temp = {};
    temp[userToken] = this.get(userToken).getSafetyData();
    Object.assign(bucket, temp);
    return bucket;
  }, {});
};
UserManager.prototype.create = function create(token, userName) {
  this.userMap[token] = new User({ userName });
  this.updateReport();
};
UserManager.prototype.destroy = function destroy(tokens) {
  tokens.forEach((token) => {
    delete this.userMap[token];
  });
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
