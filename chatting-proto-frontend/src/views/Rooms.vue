<template>
  <div class="d-flex flex-1">

  </div>
</template>

<script>
import store from '@/store';

export default {
  beforeCreate() {
    if (store.userName === '') {
      this.$router.replace('/');
      return;
    }
    this.$request('req:room:list');
  },
};
</script>
<style scoped></style>
