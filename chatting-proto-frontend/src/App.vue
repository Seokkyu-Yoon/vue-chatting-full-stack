<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
import store from '@/store';

export default {
  beforeCreate() {
    this.$socket.on('connect', () => {
      if (store.token !== null) {
        this.$request('req:user:join', { token: store.token });
      }
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
