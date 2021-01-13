<template>
  <div class="d-flex flex-fill overflow-hidden">
    <div class="d-flex flex-column flex-fill overflow-hidden">
      <UpsertRoom ref="upsertRoom" title="방 수정" v-bind:modifing="true"/>
      <div class="d-flex mt-4 mb-2">
        <p class="h3">{{(store.room || {}).roomName || ''}}</p>
        <div class="ml-auto">
          <button
            v-show="store.userName === store.room.createBy || ''"
            type="button"
            class="btn btn-sm btn-secondary mr-1"
            v-on:click="updateRoom">
            설정
          </button>
          <button type="button" class="btn btn-sm btn-danger" v-on:click="leaveRoom">나가기</button>
        </div>
      </div>
      <div class='jumbotron d-flex flex-column flex-fill overflow-hidden p-2'>
        <MessageList v-bind:sended="sended"/>
        <div class="mt-1">
          <textarea
            class="form-control"
            v-model="newMessage"
            v-on:keydown.enter.exact="(e) => {
              e.preventDefault()
              send()
            }"/>
          <div class="d-flex mt-1">
            <p>{{recipients}}에게 전송합니다</p>
            <button class="btn btn-info ml-auto" v-on:click="send">전송</button>
          </div>
        </div>
      </div>
    </div>
    <div class="d-flex col-6 col-md-4 mt-2 overflow-hidden right-menu">
      <div class="mt-3">
        <p v-bind:class="getClassTapItem('users')" @click="() => changeShowType('users')">참가자</p>
        <p v-bind:class="getClassTapItem('files')" @click="() => changeShowType('files')">파일</p>
        <p v-bind:class="getClassTapItem('detail')" @click="() => changeShowType('detail')">방정보</p>
      </div>
      <UserList v-if="showType === 'users'"/>
      <FileList v-if="showType === 'files'"/>
      <RoomDetail v-if="showType === 'detail'"/>
    </div>
  </div>
</template>

<script src="./chat.js"></script>

<style scoped>
.form-control {
  resize: none;
}
.bg-jumbotron {
  background-color: #E9ECEF;
  border-radius: 10px;
}
.bg-users {
  background-color: #B4C9E4;
}
.bg-files {
  background-color: #E4DFB4;
}
.bg-detail {
  background-color: #E4BFB4;
}
.tap-item {
  border-top-left-radius: 10px;
  border-bottom-left-radius: 10px;
  writing-mode: vertical-rl;
  text-orientation: upright;
  color: #080E15;
  cursor: pointer;
}
.right-menu {
  margin-bottom: 2rem;
}
.curr-show-type {
  padding-left: 0.75rem !important;
}
</style>
