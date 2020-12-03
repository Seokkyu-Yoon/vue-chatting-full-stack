<template>
  <div id="cover-rooms">
    <h1>방 목록</h1>
    <div id="holder-rooms">
      <div
        class="room"
        v-for="room in rooms"
        v-bind:key="`room-${room.key}`"
        @click="(e) => setCurrRoom(room, e)">
        <div class="room-key">{{room.key}}</div>
        <div class="room-name">{{room.name}}</div>
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
import myFetch from '@/core/fetch';

export default {
  name: 'Rooms',
  data() {
    return {
      newRoomName: '',
      roomMap: {},
    };
  },
  created() {
    myFetch.get(`${store.serverIp}/room`).then((result) => {
      this.roomMap = result;
    }).catch(console.error);

    this.$socket.on('room-changed', (roomMap) => {
      this.roomMap = roomMap;
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
    makeRoom() {
      if (!this.newRoomName) {
        // eslint-disable-next-line no-alert
        alert('방 이름을 입력해주세요');
        return;
      }
      myFetch.put(`${store.serverIp}/room`, {
        roomName: this.newRoomName,
      }).catch(console.error);
      this.newRoomName = '';
    },
    setCurrRoom({ key }, e) {
      if (store.getRoomKey() !== null) {
        document.querySelector('.selected').classList.remove('selected');
        this.$leave({
          roomKey: store.getRoomKey(),
        });
      }

      if (key === store.getRoomKey()) {
        store.setRoomKey(null);
        return;
      }

      e.target.closest('.room').classList.add('selected');
      this.$join({
        roomKey: key,
      });
      store.setRoomKey(key);
    },
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
