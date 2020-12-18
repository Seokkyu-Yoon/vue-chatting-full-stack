<template>
  <div class="list-group flex-fill overflow-auto">
    <div
      v-for="room in rooms"
      v-bind:key="room.roomKey"
      v-bind:class="room.roomKey === store.joiningRoomKey
        ? 'list-group-item active'
        : 'list-group-item'"
      v-on:click="(e) => setCurrRoom(room)"
      >
      <div class="d-flex justify-content-between align-items-start">
        <div class="d-flex flex-column justify-content-between align-items-start">
          <span class="badge badge-dark">
            {{room.roomPassword ? '비밀방' : '공개방'}}
          </span>
          <span class="badge badge-dark text-center mt-1">
            {{`${room.sockets.length} / ${room.roomMaxJoin || '∞'}`}}
          </span>
          <h4 class="mt-1">{{room.roomName}}</h4>
        </div>
        <div class="d-flex flex-column justify-content-between">
          <button
            type="button"
            class="btn btn-danger"
            v-show="store.userName === room.createBy"
            v-on:click.stop="() => deleteRoom(room.roomKey)">
            X
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import store from '@/store';

export default {
  name: 'RoomList',
  data() {
    return {
      store,
      newRoomName: '',
      roomMap: {},
    };
  },
  mounted() {
    if (store.userName === '') {
      this.$router.replace('/');
      return;
    }
    this.$socket.on('event:room:list', (roomMap) => {
      this.roomMap = roomMap;
    });
    this.$socket.on('res:room:list', (roomMap) => {
      this.roomMap = roomMap;
      console.log(roomMap);
    });
    this.$request('req:room:list');
  },
  computed: {
    rooms() {
      const rooms = Object.keys(this.roomMap).map((roomKey) => ({
        roomKey,
        ...this.roomMap[roomKey],
      }));
      return rooms;
    },
  },
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
        this.$request('req:user:list', { roomKey: null });
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
      this.$request('req:user:list', { roomKey });
      this.$request('req:room:messages', { roomKey });
    },
    deleteRoom(roomKey) {
      console.log(roomKey);
      this.$socket.emit('req:room:delete', { roomKey });
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.list-group-item {
  cursor: pointer;
}
</style>
