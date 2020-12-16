<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
import store from '@/store';

export default {
  mounted() {
    this.$socket.on('connect', () => {
      if (store.userName === '') return;
      this.$request('req:user:login', {
        userName: store.userName,
        roomKey: store.joiningRoomKey,
      });
      this.$request('req:room:list');
      if (store.joiningRoomKey !== null) {
        this.$request('req:user:list', { roomKey: store.joiningRoomKey });
      }
    });
    this.$socket.on('res:room:create', (roomKey) => {
      store.joiningRoomKey = roomKey;
    });
    this.$socket.on('event:user:list', (userMap) => {
      if (store.joiningRoomKey !== null) return;
      store.userMap = userMap;
    });
    this.$socket.on('res:user:list', (userMap) => {
      store.userMap = userMap;
    });
    this.$socket.on('event:room:list', (roomMap) => {
      store.roomMap = roomMap;
    });
    this.$socket.on('res:room:list', (roomMap) => {
      store.roomMap = roomMap;
    });
    this.$socket.on('event:room:messages', (messages) => {
      store.messages = messages;
    });
    this.$socket.on('res:room:messages', (messages) => {
      store.messages = messages;
    });
  },
};
</script>
<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  display: flex;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  color: #2c3e50;
}
</style>
