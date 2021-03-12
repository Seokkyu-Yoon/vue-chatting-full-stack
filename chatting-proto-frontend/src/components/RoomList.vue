<template>
  <div class="jumbotron m-0 p-2 flex-fill flex-column overflow-hidden">
    <slot />
    <div
      class="d-flex flex-wrap overflow-auto"
      ref="rooms">
      <b-card
        class="b-card m-2"
        v-for="room in rooms"
        v-bind:key="room.id"
        img-height="200"
        img-alt="Image"
        img-top
        :style="`max-width:${cardOffsetWidth}px`">
        <b-card-title class="mt-0">
          {{room.title}}
        </b-card-title>
        <b-card-sub-title class="text-right">
          <h5>
            <b-badge :variant="room.pw ? 'dark' : 'info'">{{room.pw ? '비밀' : '공개'}}</b-badge> &nbsp;
            <b-badge variant="dark">{{`${room.joining} / ${room.maxJoin || '∞'}`}}</b-badge>
          </h5>
        </b-card-sub-title>
        <a href="#"
          class="mt-1 mr-1 delete-room"
          v-show="store.user.id === room.createBy"
          v-on:click.stop="() => deleteRoom(room.id)">
          <b-icon
            class="mt-1 mr-1 delete-room"
            variant="danger"
            icon="x">
          </b-icon>
        </a>
        <div class="white-space-pre-wrap scrollable mb-2">{{room.description || ' '}}</div>
        <b-card-text class="mb-0">
          👑 {{room.createBy}}
          <p class="">
              <small class="text-muted">
              {{getFormattedCreateAt(room)}} 생성됨
            </small>
          </p>
        </b-card-text>
        <b-card-text class="mb-0">
          <b-btn
            variant="primary"
            size="sm"
            v-on:click.stop="(e) => join(room)">
            들어가기
          </b-btn>
        </b-card-text>
      </b-card>
    </div>
    <div v-if="rooms.length === 0" class="d-flex justify-content-center">
      {{emptyMessage}}.
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
