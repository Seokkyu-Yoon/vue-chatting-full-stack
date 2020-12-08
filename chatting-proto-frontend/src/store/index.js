function Store() {
  this.serverIp = 'http://192.168.1.77:3000';
  this.token = Math.random().toString(16).slice(2);
  this.selectedRoomKey = null;
}

const store = new Store();
export default store;
