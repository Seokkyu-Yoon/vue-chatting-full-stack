<template>
  <div class="jumbotron m-0 p-2 flex-fill flex-column overflow-hidden">
    <slot />
    <div v-if="mini">
      <b-list-group class="m-1">
        <b-list-group-item
          href="#"
          class="flex-column align-items-start"
          v-for="room in rooms"
          v-bind:key="room.id"
        >
          <div class="d-flex w-100 justify-content-between">
            <strong>
              <span>{{room.title.slice(0, 15)}}</span> ({{ room.joining }})
            </strong>
            <a href="#"
              v-on:click.stop="(e) => join(room)">
              <b-icon icon="arrow-right-square-fill"></b-icon>
            </a>
          </div>

        </b-list-group-item>
      </b-list-group>
    </div>
    <div
      class="d-flex flex-wrap overflow-auto"
      ref="rooms"
      v-else
      >
      <b-card
        class="b-card m-1"
        border-variant="light"
        v-for="room in rooms"
        v-bind:key="room.id"
        :style="`max-width:${cardOffsetWidth}px`"
      >
        <b-card-title class="mt-0">
          <b-badge href="#"  variant="light" @click.stop="(e) => join(room)">
            {{room.title.slice(0, 13)}}
            <b-icon icon="arrow-right-square-fill"></b-icon>
          </b-badge>
        </b-card-title>
        <b-card-sub-title class="text-left">
          <h5>
            <b-badge :variant="room.pw ? 'dark' : 'primary'">{{room.pw ? '비밀' : '공개'}}</b-badge> &nbsp;
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
        <div class="white-space-pre-wrap scrollable">
          {{ room.description.slice(0,12) || ' ' }}
        </div>
        <div>
          <b-badge variant="secondary" class="mr-1">{{room.createBy}}</b-badge>
          <br>
          <small class="text-muted">
            {{getFormattedCreateAt(room)}} 생성됨
          </small>
        </div>
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
