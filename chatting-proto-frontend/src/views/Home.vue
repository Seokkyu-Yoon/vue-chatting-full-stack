<template>
  <div id="cover">
    <ComponentLogin />
  </div>
</template>

<script>
// @ is an alias to /src
import ComponentLogin from '@/components/Login.vue';

export default {
  name: 'Home',
  components: {
    ComponentLogin,
  },
};
</script>

<style scoped>
#cover {
  display: flex;
  flex: 1;
}
</style>
