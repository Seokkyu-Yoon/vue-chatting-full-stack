<template>
  <div class="d-flex flex-column p-3">
    <UpsertRoom ref="upsertRoom" />
    <!-- <div class="mb-4">
      <b-input-group>
        <b-btn type="button" variant="success" v-on:click="createRoom">+</b-btn>
        <input type="text" class="form-control inline " placeholder="검색"/>
        <b-btn variant="info">검색</b-btn>
      </b-input-group>
    </div> -->
    <div class="d-flex mb-2">
      <div class="flex-grow-1"><b-btn type="button" variant="success" v-on:click="createRoom">+</b-btn></div>
      <div><input type="text" class="form-control" placeholder="검색"/></div>
      <div><b-btn class="ml-1" variant="info">검색</b-btn></div>
    </div>

    <RoomList />
  </div>
</template>

<script src="./rooms.js"></script>

<style scoped>
  .inline {
    display: inline;
  }
</style>
