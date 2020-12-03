<template>
  <div id="cover">
    <ComponentEnter />
  </div>
</template>

<script>
// @ is an alias to /src
import ComponentEnter from '@/components/Enter.vue';

export default {
  name: 'Home',
  components: {
    ComponentEnter,
  },
};
</script>

<style scoped>
#cover {
  display: flex;
  flex: 1;
}
</style>
