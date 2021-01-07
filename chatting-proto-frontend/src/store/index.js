import Vue from 'vue'

const vue = new Vue({
  data: {
    userName: '',
    room: {},
    users: [],
    rooms: [],
    messages: [],
    startIndexRoom: 0,
    startIndexUser: 0,
    minIndexMessage: -1
  }
})

export default vue
