<template>
  <div class="flex-fill d-flex flex-column p-3 overflow-hidden">
    <UpsertRoom ref="upsertRoom" />
    <div class="d-flex mb-2">
      <div class="flex-fill mr-1"><b-btn type="button" variant="success" v-on:click="createRoom">+</b-btn></div>
      <div><input type="text" v-model="store.searchRoomText" @input="search" class="form-control" placeholder="검색"/></div>
    </div>

    <RoomList />
  </div>
</template>

<script src="./rooms.js"></script>
