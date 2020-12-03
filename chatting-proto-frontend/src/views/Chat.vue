<template>
  <div id="cover">
    <ComponentRooms />
    <ComponentChat v-if="store.getRoomKey()"/>
    <ComponentUsers />
  </div>
</template>

<script>
// import myFetch from '@/core/fetch';
// @ is an alias to /src
import store from '@/store';
import myFetch from '@/core/fetch';
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
  data() {
    return {
      store,
      currRoomKey: '',
      userName: '',
    };
  },
  mounted() {
    myFetch.get(`${store.serverIp}/user/exists`, { socketId: this.$socket.id }).then((isExists) => {
      if (!isExists) {
        this.$router.replace('/');
        store.setRoomKey(null);
      }
    }).catch(console.error);
    this.$socket.on('disconnect', () => {
      this.$router.replace('/');
      store.setRoomKey(null);
    });
  },
  methods: {
  },
};
</script>

<style scoped>
#cover {
  display: flex;
  flex: 1;
}
</style>
