import Vue from 'vue'

const vue = new Vue({
  data: {
    userId: -1,
    userName: '',
    room: {},
    users: [],
    recipients: [],
    rooms: [],
    roomCount: 0,
    messages: [],
    startIndexRoom: 0,
    startIndexUser: 0,
    minIndexMessage: -1,
    searchRoomText: ''
  }
})

export default vue
