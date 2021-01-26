<template>
    <div id="app">
      <Nav />
      <router-view id="router-view" class="container w-100 h-100"/>
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
  position: absolute;
  top: 0;
  right: 0;
  bottom: 55.75px;
  left: 0;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
html, body, nav, #router-view {
  /* min-width: 500px; */
}
</style>
