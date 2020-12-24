<template>
  <div class="list-group flex-fill overflow-auto">
    <div
      class="list-group-item"
      v-show="Object.keys(store.roomMap).length > 0"
      v-for="(room, roomKey) in store.roomMap"
      v-bind:key="roomKey"
      v-on:click="(e) => setCurrRoom(roomKey)"
      >
      <div class="d-flex justify-content-between align-items-start">
        <div class="d-flex flex-column justify-content-between align-items-start">
          <span class="badge badge-dark">
            {{room.roomPassword ? '비밀방' : '공개방'}}
          </span>
          <span class="badge badge-dark text-center mt-1">
            {{`${room.sockets.length} / ${room.roomMaxJoin || '∞'}`}}
          </span>
          <h4 class="mt-1">{{room.roomName}}</h4>
        </div>
        <div class="d-flex flex-column justify-content-between">
          <button
            type="button"
            class="btn btn-sm btn-danger"
            v-show="store.userName === room.createBy"
            v-on:click.stop="() => deleteRoom(roomKey)">
            X
          </button>
        </div>
      </div>
    </div>
    <div v-show="Object.keys(store.roomMap).length === 0">
      방이 없습니다
    </div>
  </div>
</template>

<script src='./room-list.js'></script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.list-group-item {
  cursor: pointer;
}
</style>
