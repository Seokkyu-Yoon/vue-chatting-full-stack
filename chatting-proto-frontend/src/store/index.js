import Vue from 'vue'

const vue = new Vue({
  data: {
    serverIp: `http://192.168.1.77:${process.env.VUE_APP_SERVER_PORT}`,
    userName: '',
    room: {},
    users: [],
    rooms: [],
    messages: [],
    startIndexRoom: 0,
    startIndexUser: 0,
    finalPositionMessage: -1
  }
})

export default vue
