<template>
  <div id="cover">
    <ComponentRooms v-bind:rooms="rooms"/>
    <ComponentChat
      v-if="store.joiningRoomKey !== null"
      v-bind:roomKey="store.joiningRoomKey"
      v-bind:messages="store.messages"/>
    <ComponentUsers v-bind:users="users"/>
  </div>
</template>

<script>
// import myFetch from '@/core/fetch';
// @ is an alias to /src
import store from '@/store';
import ComponentRooms from '@/components/Rooms.vue';
import ComponentChat from '@/components/Chat.vue';
import ComponentUsers from '@/components/Users.vue';

export default {
  name: 'Chatting',
  components: {
    ComponentRooms,
    ComponentChat,
    ComponentUsers,
  },
  data() {
    return {
      store,
      userMap: {},
    };
  },
  beforeCreate() {
    if (store.userName === '') {
      this.$router.replace('/');
      return;
    }
    this.$request('req:room:list');
  },
  computed: {
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
    rooms() {
      return Object.keys(store.roomMap).map((roomKey) => ({
        roomKey,
        ...store.roomMap[roomKey],
      }));
    },
  },
};
</script>

<style scoped>
#cover {
  display: flex;
  flex: 1;
}
</style>
