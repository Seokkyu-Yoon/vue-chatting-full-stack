<template>
  <div class="d-flex flex-column flex-fill p-3 overflow-hidden">
    <form class="form-inline mt-2 mb-4">
      <button type="button" class="btn btn-success">+</button>
      <div class="ml-auto">
        <input type="text" class="form-control mr-1" placeholder="검색"/>
        <button type="button" class="btn btn-info">검색</button>
      </div>
    </form>
    <RoomList />
  </div>
</template>

<script>
// import myFetch from '@/core/fetch';
// @ is an alias to /src
import store from '@/store';
import RoomList from '@/components/RoomList.vue';

export default {
  name: 'Rooms',
  components: {
    RoomList,
  },
  data() {
    return {
      store,
      userMap: {},
    };
  },
};
</script>

<style scoped></style>
