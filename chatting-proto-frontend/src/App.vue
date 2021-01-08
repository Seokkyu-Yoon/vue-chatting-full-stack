<template>
  <div id="app">
    <Nav />
    <router-view/>
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
  height: 100%;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

</style>
