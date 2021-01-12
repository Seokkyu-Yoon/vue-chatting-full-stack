<template>
  <div class="list-group flex-fill overflow-auto">
    <Password ref="password" v-bind:title="store.room.roomName"/>
    <b-card-group columns v-if="store.rooms.length > 0">
      <b-card
        v-for="(room, idx) in store.rooms"
        v-bind:key="room.roomKey"
        :img-src='"https://picsum.photos/200/100?random=" + idx'
        img-alt="Image"
        img-top>
        <b-card-sub-title>
          <p class="h5 mb-1">
            <span v-bind:class="getClassBadgeSecret(room)">
              {{room.roomPassword ? '비밀방' : '공개방'}}
            </span>
            <span v-bind:class="getClassBadgeMaxJoin(room)">
              {{`${room.joining} / ${room.roomMaxJoin || '∞'}`}}
            </span>
          </p>
          <div class="mt-2">
            <p class="h4">{{room.roomName}}</p>
          </div>
        </b-card-sub-title>
        <b-btn
          class="mt-1 mr-1 delete-room"
          size="sm"
          variant="danger"
          v-show="store.userName === room.createBy"
          v-on:click.stop="() => deleteRoom(room.roomKey)">
          X
        </b-btn>
        <div class="d-flex flex-column align-items-start">
          <b-card-text>{{room.roomDesc}}</b-card-text>
          <div class="w-100 d-flex justify-content-end">
            <b-btn
              class='ml-auto'
              variant="primary"
              size="sm"
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
