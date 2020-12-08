<template>
  <div id="cover">
    <ComponentRooms v-bind:roomMap="roomMap"/>
    <ComponentChat v-if="store.selectedRoomKey !== null" v-bind:roomKey="store.selectedRoomKey"/>
    <ComponentUsers v-bind:userMap="userMap"/>
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
  name: 'Chat',
  components: {
    ComponentRooms,
    ComponentChat,
    ComponentUsers,
  },
  beforeCreate() {
    this.$request('req:room:list');
    this.$request('req:user:list');
    this.$socket.on('event:user:list', (userMap) => {
      this.userMap = userMap;
    });
    this.$socket.on('res:user:list', (userMap) => {
      this.userMap = userMap;
    });
    this.$socket.on('event:room:list', (roomMap) => {
      this.roomMap = roomMap;
    });
    this.$socket.on('res:room:list', (roomMap) => {
      this.roomMap = roomMap;
    });
  },
  data() {
    return {
      store,
      userMap: {},
      roomMap: {},
    };
  },
  updated() {
    if (typeof this.userMap[store.token] === 'undefined') {
      this.$router.replace('/');
    }
  },
};
</script>

<style scoped>
#cover {
  display: flex;
  flex: 1;
}
</style>
