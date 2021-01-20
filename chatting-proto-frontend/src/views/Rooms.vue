<template>
  <div class="d-flex flex-column p-3">
    <UpsertRoom ref="upsertRoom" />
    <div class="form-inline mb-4">
      <button type="button" class="btn btn-success mt-1" v-on:click="createRoom">+</button>
      <input type="text" class="form-control mt-1 mr-1 ml-auto" placeholder="검색"/>
      <button type="button" class="btn btn-info mt-1">검색</button>
    </div>
    <RoomList />
  </div>
</template>

<script src="./rooms.js"></script>

<style scoped>
</style>
