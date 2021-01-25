<template>
  <div class="d-flex flex-column flex-fill overflow-hidden-y">
    <Password ref="password" v-bind:propTitle="store.room.title"/>
    <div
      class="d-flex flex-wrap jumbotron mb-4 p-2 overflow-auto"
      v-if="store.rooms.length > 0">
      <b-card
        class="b-card m-2"
        v-for="(room, idx) in store.rooms"
        v-bind:key="room.id"
        :img-src='`https://picsum.photos/id/${idx}/500/300`'
        img-height="200"
        img-alt="Image"
        img-top>
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
    </div>
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

.b-card {
  width: 32rem;
  min-width: 32rem;
}
@media screen and (min-width: 768px) {
  .b-card {
    width: 20rem;
    min-width: 20rem;
  }
}
@media screen and (min-width: 992px) {
  .b-card {
    width: 18rem;
    min-width: 18rem;
  }
}
@media screen and (min-width: 1200px) {
  .b-card {
    width: 21.75rem;
    min-width: 21.75rem;
  }
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
