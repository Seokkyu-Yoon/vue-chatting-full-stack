<template>
  <div class="jumbotron m-0 p-2 flex-fill d-flex flex-column overflow-hidden">
    <Password ref="password" v-bind:propTitle="store.room.title"/>
    <div
      class="d-flex flex-wrap overflow-auto"
      ref="rooms">
      <b-card
        class="b-card m-2"
        v-for="(room, idx) in store.rooms"
        v-bind:key="room.id"
        :img-src='`https://picsum.photos/id/${idx}/500/300`'
        img-height="200"
        img-alt="Image"
        img-top
        :style="`max-width:${cardOffsetWidth}px`">
        <b-card-sub-title>
          <p class="h5 mb-1">
            <span v-bind:class="getClassBadgeSecret(room)">
              {{room.pw ? '비밀방' : '공개방'}}
            </span>
            <span v-bind:class="getClassBadgeMaxJoin(room)">
              {{`${room.joining} / ${room.maxJoin || '∞'}`}}
            </span>
          </p>
          <div class="mt-2">
            <p class="h4">{{room.title}}</p>
          </div>
        </b-card-sub-title>
        <b-btn
          class="mt-1 mr-1 delete-room"
          size="sm"
          variant="danger"
          v-show="store.userName === room.createBy"
          v-on:click.stop="() => deleteRoom(room.id)">
          X
        </b-btn>
        <div class="d-flex flex-column flex-fill justify-content-between">
          <div class="white-space-pre-wrap scrollable mb-2">{{room.description}}</div>
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
      <p v-if="store.rooms.length === 0" class="h1">존재하는 방이 없습니다</p>
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

.b-card {
  flex: 1 1 15rem;
}

.jumbotron {
  margin-bottom: 0;
  padding: 0;
}
.card-body {
  display: flex;
  flex: 1;
  flex-direction: column;
}
.white-space-pre-wrap {
  white-space: pre-wrap;
}
.scrollable {
  overflow: auto;
  max-height: 7rem;
}
.overflow-hidden-y {
  overflow-y: hidden;
}
</style>
