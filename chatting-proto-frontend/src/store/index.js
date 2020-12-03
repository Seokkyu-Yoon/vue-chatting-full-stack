function Store() {
  this.roomKey = null;
  this.serverIp = 'http://192.168.1.77:3000';
}
Store.prototype.setRoomKey = function setRoomKey(roomKey) {
  this.roomKey = roomKey;
};
Store.prototype.getRoomKey = function getRoomKey() {
  return this.roomKey;
};

const store = new Store();
export default store;
