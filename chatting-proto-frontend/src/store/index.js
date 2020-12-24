import Vue from 'vue'

const vue = new Vue({
  data: {
    serverIp: `http://192.168.1.77:${process.env.VUE_APP_SERVER_PORT}`,
    userName: '',
    joiningRoomKey: null,
    userMap: {},
    roomMap: {},
    messages: []
  }
})

export default vue
