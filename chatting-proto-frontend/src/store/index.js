function Store() {
  this.serverIp = 'http://192.168.1.77:3000';
  this.joiningRoomKey = null;
  this.userName = '';
  this.userMap = {};
  this.roomMap = {};
  this.messages = [];
}

const store = new Store();
export default store;
