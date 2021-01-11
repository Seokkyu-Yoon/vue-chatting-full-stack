<template>
  <div class="list-group flex-fill overflow-auto">

    <b-card-group columns>
      <b-card
        v-show="store.rooms.length > 0"
        v-for="(room, idx) in store.rooms"
        v-bind:key="room.roomKey"
        :title="room.roomName"
        :img-src='"https://picsum.photos/200/100?random=" + idx'
        img-alt="Image"
        img-top
      >
      <b-card-text>
        {{ room.roomDesc }}
      </b-card-text>

      <div class="form-inline">
        <b-btn size="sm">{{room.roomPassword ? '비밀방' : '공개방'}}</b-btn>
        <!-- <b-form-input v-if="room.roomPassword" placeholder="비밀번호를 입력해주세요" v-model="password[room.roomKey]"/> -->
        <b-btn
          size="sm"
          class="ml-1"
          v-on:click.stop="(e) => setCurrRoom(room)"> 참가 </b-btn>
          <b-btn
          size="sm"
          class="ml-1 btn-danger"
          v-visible="store.userName === room.createBy"
          v-on:click.stop="() => deleteRoom(room.roomKey)">
          X
        </b-btn>
      </div>

      <b-list-group flush>
      <b-list-group-item>
        {{ room.joining }}
      </b-list-group-item>
    </b-list-group>

    </b-card>
    </b-card-group>
    <!--
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
          <h4 class="mt-1">{{room.roomName}}</h4>
          <span class="badge badge-dark">
            {{room.roomPassword ? '비밀방' : '공개방'}}
          </span>
          <span class="badge badge-dark text-center mt-1">
            {{`${room.joining} / ${room.roomMaxJoin || '∞'}`}}
          </span>
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
            <input type="password" class="form-control" v-visible="room.roomPassword" placeholder="비밀번호를 입력해주세요" v-model="password[room.roomKey]"/>
            <button
              type="button"
              class="btn btn-sm btn-primary ml-1"
              v-on:click.stop="(e) => setCurrRoom(room)">
              참가
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-show="store.rooms.joining === 0">
      방이 없습니다
    </div>
    -->
  </div>
</template>

<script src='./room-list.js'></script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.list-group-item {
  cursor: pointer;
}
</style>
