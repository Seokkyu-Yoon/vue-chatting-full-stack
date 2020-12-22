<template>
  <div class="d-flex flex-column flex-fill p-3 overflow-hidden">
    <UpsertRoom ref="upsertRoom" title="방 생성" />
    <div class="d-flex mt-2 mb-4">
      <button type="button" class="btn btn-success" v-on:click="createRoom">
        +
      </button>
      <div class="form-inline ml-auto">
        <input type="text" class="form-control mr-1" placeholder="검색"/>
        <button type="button" class="btn btn-info">검색</button>
      </div>
    </div>
    <RoomList />
  </div>
</template>

<script>
// import myFetch from '@/core/fetch';
// @ is an alias to /src
import store from '@/store';
import RoomList from '@/components/RoomList.vue';
import UpsertRoom from '@/components/UpsertRoom.vue';

export default {
  name: 'Rooms',
  components: {
    RoomList,
    UpsertRoom,
  },
  data() {
    return {
      store,
      userMap: {},
    };
  },
  methods: {
    createRoom() {
      this.$refs.upsertRoom.$refs.modal.show();
    },
  },
  beforeMount() {
    if (store.userName === '') {
      this.$router.go(-1);
      return;
    }
    if (store.joiningRoomKey !== null) {
      this.$request('req:room:leave', { roomKey: store.joiningRoomKey });
      store.joiningRoomKey = null;
    }
  },
};
</script>

<style scoped></style>
