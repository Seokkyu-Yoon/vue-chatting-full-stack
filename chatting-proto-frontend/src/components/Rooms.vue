<template>
  <div id="cover-rooms">
    <h1>방 목록</h1>
    <div id="holder-rooms">
      <div
        v-for="room in rooms"
        v-bind:key="`room-${room.roomKey}`"
        v-bind:class="store.selectedRoomKey === room.roomKey ? 'room selected': 'room'"
        @click="(e) => setCurrRoom(room)">
        <div class="room-key">{{room.roomKey}}</div>
        <div class="room-name">{{room.roomName}}</div>
      </div>
    </div>
    <input type="text"
      v-model="newRoomName"
      v-on:keyup.enter="makeRoom"
      placeholder="새로운 방 이름을 입력해주세요"/>
    <button v-on:click="makeRoom">+ 방 추가</button>
  </div>
</template>

<script>
import store from '@/store';

export default {
  name: 'Rooms',
  data() {
    return {
      store,
      newRoomName: '',
    };
  },
  props: ['roomMap'],
  beforeCreate() {
    this.$socket.on('res:room:create', (roomKey) => {
      store.selectedRoomKey = roomKey;
    });
  },
  computed: {
    rooms() {
      return Object.keys(this.roomMap).map((roomKey) => ({
        key: roomKey,
        ...this.roomMap[roomKey],
      }));
    },
  },
  methods: {
    leaveRoom() {
      if (store.selectedRoomKey !== null) {
        this.$request('req:room:leave', {
          roomKey: store.selectedRoomKey,
        });
      }
    },
    makeRoom() {
      if (!this.newRoomName) {
        // eslint-disable-next-line no-alert
        alert('방 이름을 입력해주세요');
        return;
      }
      this.leaveRoom();
      this.$request('req:room:create', { roomName: this.newRoomName });
      this.newRoomName = '';
    },
    setCurrRoom({ roomKey }) {
      this.leaveRoom();

      if (roomKey === store.selectedRoomKey) {
        store.selectedRoomKey = null;
        return;
      }

      this.$request('req:room:join', { roomKey });
      store.selectedRoomKey = roomKey;
    },
  },
  beforeDestroy() {
    if (store.selectedRoomKey !== null) {
      this.$request('req:room:leave', {
        roomKey: store.selectedRoomKey,
      });
      store.selectedRoomKey = null;
    }
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1 {
  text-align: center;
}
#cover-rooms {
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 10px;
}

#holder-rooms {
  overflow-y: scroll;
  flex: 1;
  margin-bottom: 20px;
  padding: 10px;
  border-radius: 10px;
  background-color: khaki;
}

.room {
  margin-bottom: 10px;
  border-radius: 5px;
  padding: 5px;
  background-color: salmon;
  cursor: pointer;
}

.selected {
  background-color: aquamarine;
}

.room-name {
  font-size: 16px;
  font-weight: bold;
}

.room-key {
  font-size: 12px;
  text-align: right;
  font-style: italic;
}

</style>
