<template>
  <div class="p-3">
    <UpsertRoom ref="upsertRoom" title="방 생성" />
    <div class="d-flex mt-2 mb-4 w-100">
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

<script src="./rooms.js"></script>

<style scoped></style>
