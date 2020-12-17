function Store() {
  this.serverIp = `http://192.168.1.77:${process.env.VUE_APP_SERVER_PORT}`;
  this.userName = '';
  this.joiningRoomKey = null;
  this.userMap = {};
  this.roomMap = {};
  this.messages = [];
}

const store = new Store();
export default store;
