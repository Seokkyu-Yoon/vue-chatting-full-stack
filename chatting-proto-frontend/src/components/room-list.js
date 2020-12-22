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
  computed: {
    rooms() {
      const rooms = Object.keys(store.roomMap).map((roomKey) => ({
        roomKey,
        ...store.roomMap[roomKey],
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
      this.$router.push('Chat');
      this.$request('req:user:list', { roomKey });
      this.$request('req:room:messages', { roomKey });
    },
    deleteRoom(roomKey) {
      this.$socket.emit('req:room:delete', { roomKey });
    },
  },
  mounted() {
    this.$request('req:room:list');
  },
};
