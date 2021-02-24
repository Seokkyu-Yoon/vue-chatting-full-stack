<template>
    <div id="app">
      <Nav />
      <router-view id="router-view" class="overflow-hidden"/>
    </div>
</template>

<script>
import Nav from '@/components/Navigation.vue'

export default {
  components: {
    Nav
  }
}
</script>

<style>
@keyframes shake {
  0% { transform: translate(5px, 0px); }
  10% { transform: translate(-5px, 0px); }
  20% { transform: translate(4px, 0px); }
  30% { transform: translate(-4px, 0px); }
  40% { transform: translate(3px, 0px); }
  50% { transform: translate(-3px, 0px); }
  60% { transform: translate(-2px, 0px); }
  70% { transform: translate(2px, 0px); }
  80% { transform: translate(-1px, 0px); }
  90% { transform: translate(1px, 0px); }
  100% { transform: translate(0px, 0px); }
}

html, body{
  height: 100%;
}

.flex-1 {
  flex: 1
}
.btn {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

#app {
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* text-align: center; */
  overflow: hidden;
  color: #2c3e50;
}

.shake {
  animation: shake 0.5s 1;
}
</style>
