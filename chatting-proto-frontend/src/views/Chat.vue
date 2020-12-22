<template>
  <div class="d-flex flex-fill overflow-hidden">
    <div class="d-flex flex-column col-13.5 col-md-9 overflow-hidden">
      <UpsertRoom ref="upsertRoom" title="방 수정" v-bind:modifing="true"/>
      <div class="d-flex align-items-center mt-2 mb-4">
        <p class="h3 text-center">{{title}}</p>
        <div class="ml-auto">
          <button type="button" class="btn btn-sm btn-secondary mr-1" v-on:click="updateRoom">
            설정
          </button>
          <button type="button" class="btn btn-sm btn-danger" v-on:click="leaveRoom">나가기</button>
        </div>
      </div>
      <MessageList v-bind:messages="store.messages"/>
    </div>
    <div class="d-flex flex-column col-4.5 col-md-3 ml-3 p-3 overflow-hidden">
      <UserList v-bind:users="users"/>
    </div>
  </div>
</template>

<script>
// import myFetch from '@/core/fetch';
// @ is an alias to /src
import store from '@/store';
import UpsertRoom from '@/components/UpsertRoom.vue';
import MessageList from '@/components/MessageList.vue';
import UserList from '@/components/UserList.vue';

export default {
  name: 'Chat',
  components: {
    UpsertRoom,
    MessageList,
    UserList,
  },
  data() {
    return {
      store,
    };
  },
  methods: {
    updateRoom() {
      this.$refs.upsertRoom.$refs.modal.show();
    },
    leaveRoom() {
      this.$request('req:room:leave', { roomKey: store.joiningRoomKey });
      this.$router.go(-1);
    },
  },
  beforeCreate() {
    if (store.joiningRoomKey === null || store.userName === '') {
      this.$router.go(-1);
    }
  },
  computed: {
    title() {
      if (store.joiningRoomKey === null) return '';
      if (typeof store.roomMap[store.joiningRoomKey] === 'undefined') return '';
      return store.roomMap[store.joiningRoomKey].roomName;
    },
    users() {
      const socketIds = Object.keys(store.userMap);
      if (store.joiningRoomKey === null) {
        return socketIds.map((socketId) => ({
          socketId,
          userName: store.userMap[socketId].userName,
        }));
      }
      return socketIds.reduce((bucket, socketId) => {
        const user = store.userMap[socketId];
        if (!store.roomMap[store.joiningRoomKey].sockets.includes(socketId)) {
          return bucket;
        }
        bucket.push({
          socketId,
          userName: user.userName,
        });
        return bucket;
      }, []);
    },
  },
};
</script>

<style scoped></style>
