<template>
    <div id="app">
      <Nav />
      <router-view class="container w-100 h-100" style="min-width: 576px;"/>
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
  min-width: 576px;
}
#app {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 55.75px;
  left: 0;
  min-width: 576px;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>
