<template>
  <div id="cover-rooms">
    <h1>방 목록</h1>
    <div id="holder-rooms">
      <div
        v-for="room in rooms"
        v-bind:key="`room-${room.roomKey}`"
        v-bind:class="store.joiningRoomKey === room.roomKey ? 'room selected': 'room'"
        @click="(e) => setCurrRoom(room)">
        <div class="room-key">{{room.roomKey}}</div>
        <div class="room-name">{{room.roomName}}</div>
        <div>{{room.sockets.length}}</div>
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
  props: ['rooms'],
  methods: {
    leaveRoom() {
      if (store.joiningRoomKey !== null) {
        this.$request(
          'req:room:leave',
          {
            userName: store.userName,
            roomKey: store.joiningRoomKey,
          },
        );
      }
    },
    makeRoom() {
      if (!this.newRoomName) {
        // eslint-disable-next-line no-alert
        alert('방 이름을 입력해주세요');
        return;
      }
      this.$request(
        'req:room:create',
        {
          userName: store.userName,
          roomName: this.newRoomName,
        },
      );
      this.newRoomName = '';
    },
    setCurrRoom({ roomKey }) {
      const { joiningRoomKey } = store;
      if (joiningRoomKey !== null) {
        this.$request('req:room:leave', {
          userName: store.userName,
          roomKey: joiningRoomKey,
        });
      }
      if (roomKey === joiningRoomKey) {
        store.joiningRoomKey = null;
        return;
      }

      this.$request(
        'req:room:join',
        {
          userName: store.userName,
          roomKey,
        },
      );
      store.joiningRoomKey = roomKey;
      this.$request('req:room:messages', { roomKey });
    },
  },
  beforeDestroy() {
    if (store.joiningRoomKey !== null) {
      this.$request(
        'req:room:leave',
        {
          userName: store.userName,
          roomKey: store.joiningRoomKey,
        },
      );
      store.joiningRoomKey = null;
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
