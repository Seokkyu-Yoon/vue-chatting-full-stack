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
html, body{
  height: 100%;
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
</style>
