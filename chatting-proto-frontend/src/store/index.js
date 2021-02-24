import Vue from 'vue'

const vue = new Vue({
  data: {
    user: null,
    room: null,
    users: [],
    recipients: [],
    rooms: [],
    roomsJoined: [],
    roomsSearched: [],
    startIndexRoom: 0,
    startIndexRoomJoined: 0,
    startIndexRoomSearched: 0,
    messages: [],
    minIndexMessage: -1,
    searchRoomText: ''
  }
})

export default vue
