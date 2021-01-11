<template>
  <div class="list-group flex-fill overflow-auto">
    <div
      class="list-group-item"
      v-show="store.rooms.length > 0"
      v-for="room in store.rooms"
      v-bind:key="room.roomKey"
      v-on:click="(e) => {

      }"
      >
      <div class="d-flex justify-content-between">
        <div class="d-flex flex-column justify-content-between align-items-start">
          <span class="badge badge-dark">
            {{room.roomPassword ? '비밀방' : '공개방'}}
          </span>
          <span class="badge badge-dark text-center mt-1">
            {{`${room.joining} / ${room.roomMaxJoin || '∞'}`}}
          </span>
          <h4 class="mt-1">{{room.roomName}}</h4>
        </div>
        <div class="d-flex flex-column justify-content-between align-items-end">
          <button
            type="button"
            class="btn btn-sm btn-danger"
            v-visible="store.userName === room.createBy"
            v-on:click.stop="() => deleteRoom(room.roomKey)">
            X
          </button>

          <div class="form-inline">
            <input
              type="password"
              class="form-control"
              v-visible="room.roomPassword"
              placeholder="비밀번호를 입력해주세요"
              v-model="password[room.roomKey]"
              v-on:keydown.enter.exact="setCurrRoom(room)"/>
            <button
              type="button"
              class="btn btn-sm btn-primary ml-1"
              v-on:click.stop="(e) => setCurrRoom(room)">
              참가
            </b-btn>
          </div>
        </div>
      </b-card>
    </b-card-group>
    <div v-else>
      <p class="h1">존재하는 방이 없습니다</p>
    </div>
  </div>
</template>

<script src='./room-list.js'></script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.list-group-item {
  cursor: pointer;
}
.delete-room {
  position: absolute;
  top: 0;
  right: 0;
}

</style>
